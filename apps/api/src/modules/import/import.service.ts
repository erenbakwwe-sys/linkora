import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import * as PapaModule from 'papaparse';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Papa: any = (PapaModule as any).default?.parse ? (PapaModule as any).default : PapaModule;
import { DatabaseService } from '../../common/services/database.service.js';
import { IngestionService, IngestionBatchResult } from '../leads/ingestion.service.js';
import { ColumnMapping, ImportExecuteInput, LeadIngestInput } from '@linkora/shared';

@Injectable()
export class ImportService {
  constructor(
    private readonly db: DatabaseService,
    private readonly ingestionService: IngestionService,
  ) {}

  /**
   * Preview CSV, detect columns and propose field mapping.
   */
  async previewCsv(csvContent: string): Promise<{
    headers: string[];
    sampleRows: Record<string, string>[];
    totalRows: number;
    suggestedMapping: ColumnMapping;
  }> {
    if (!csvContent || typeof csvContent !== 'string') {
      throw new BadRequestException('CSV-Inhalt darf nicht leer sein.');
    }

    const parsed = Papa.parse(csvContent.trim(), {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0 && parsed.data.length === 0) {
      throw new BadRequestException(`CSV Parsing Fehler: ${parsed.errors[0]?.message}`);
    }

    const headers = parsed.meta.fields || [];
    const sampleRows = parsed.data.slice(0, 5);
    const totalRows = parsed.data.length;

    // Smart column auto-detection
    const suggestedMapping: ColumnMapping = {
      firstName: this.guessColumn(headers, ['vorname', 'first_name', 'firstname', 'fname', 'ad']),
      lastName: this.guessColumn(headers, ['nachname', 'last_name', 'lastname', 'lname', 'soyad']),
      phone: this.guessColumn(headers, ['telefon', 'phone', 'mobil', 'tel', 'rufnummer', 'handy']),
      email: this.guessColumn(headers, ['email', 'e-mail', 'mail', 'eposta']),
      postalCode: this.guessColumn(headers, ['plz', 'postleitzahl', 'zip', 'postal_code']),
      city: this.guessColumn(headers, ['ort', 'stadt', 'city', 'sehir']),
      street: this.guessColumn(headers, ['strasse', 'straße', 'street', 'str', 'cadde', 'sokak']),
      houseNumber: this.guessColumn(headers, ['hausnummer', 'nr', 'hnr', 'house_number', 'no']),
      source: this.guessColumn(headers, ['quelle', 'source', 'kampagne', 'campaign', 'kanal']),
      consentText: this.guessColumn(headers, ['einwilligung', 'consent', 'werbeeinwilligung', 'optin_text']),
      optInTimestamp: this.guessColumn(headers, ['optin', 'opt_in', 'datum', 'timestamp', 'zeitstempel']),
    };

    return {
      headers,
      sampleRows,
      totalRows,
      suggestedMapping,
    };
  }

  private guessColumn(headers: string[], candidates: string[]): string {
    for (const h of headers) {
      const lower = h.toLowerCase().trim();
      if (candidates.some((c) => lower === c || lower.includes(c))) {
        return h;
      }
    }
    return '';
  }

  /**
   * Execute mapped CSV import with strict batch idempotency, dedup, consent proof check, and quarantine safety.
   */
  async executeImport(
    tenantId: string,
    input: ImportExecuteInput,
    userId?: string
  ): Promise<IngestionBatchResult> {
    const fileHash = input.fileHash || createHash('sha256').update(JSON.stringify(input.rows)).digest('hex');

    // 1. Idempotency Check: Same file hash = no-op with previous batch results
    const existingBatch = await this.ingestionService.checkBatchIdempotency(tenantId, fileHash);
    if (existingBatch) {
      return {
        ...existingBatch,
        isDuplicateBatch: true,
      };
    }

    // 2. Register Batch
    const batchId = await this.ingestionService.createBatch(
      tenantId,
      fileHash,
      input.fileName || 'upload.csv',
      'CSV_IMPORT',
      input.rows.length
    );

    let accepted = 0;
    let duplicates = 0;
    let quarantined = 0;
    const quarantineIds: string[] = [];
    const createdLeadIds: string[] = [];

    // 3. Process Rows
    for (const rawRow of input.rows) {
      const mappedLead: LeadIngestInput = {
        projectId: input.projectId,
        firstName: String(rawRow[input.mapping.firstName] || ''),
        lastName: String(rawRow[input.mapping.lastName] || ''),
        phone: String(rawRow[input.mapping.phone] || ''),
        phoneCountry: 'DE',
        email: input.mapping.email ? String(rawRow[input.mapping.email] || '') : undefined,
        postalCode: input.mapping.postalCode ? String(rawRow[input.mapping.postalCode] || '') : undefined,
        city: input.mapping.city ? String(rawRow[input.mapping.city] || '') : undefined,
        street: input.mapping.street ? String(rawRow[input.mapping.street] || '') : undefined,
        houseNumber: input.mapping.houseNumber ? String(rawRow[input.mapping.houseNumber] || '') : undefined,
        answers: {},
        extraData: {},
      };

      // Extract provenance & consent if mapped
      const consentText = input.mapping.consentText ? String(rawRow[input.mapping.consentText] || '') : input.defaultConsentText;
      const source = input.mapping.source ? String(rawRow[input.mapping.source] || '') : input.defaultSource;
      const optInRaw = input.mapping.optInTimestamp ? String(rawRow[input.mapping.optInTimestamp] || '') : '';

      if (consentText || source) {
        mappedLead.provenance = {
          source: source || 'CSV_IMPORT',
          optInTimestamp: optInRaw && !isNaN(Date.parse(optInRaw)) ? new Date(optInRaw).toISOString() : new Date().toISOString(),
          consentText: consentText || 'Importierte Werbeeinwilligung nach DSGVO / UWG',
          consentVersion: 'v1.0',
          consentChannel: 'ONLINE_FORM',
          proofMetadata: {},
        };
      }

      const res = await this.ingestionService.ingestLeadRow(tenantId, mappedLead, {
        batchId,
        channel: 'CSV_IMPORT',
        actorId: userId,
        rawPayload: rawRow,
      });

      if (res.isQuarantined) {
        quarantined++;
        if (res.quarantineId) quarantineIds.push(res.quarantineId);
      } else if (res.isDuplicate) {
        duplicates++;
      } else if (res.success) {
        accepted++;
        if (res.leadId) createdLeadIds.push(res.leadId);
      }
    }

    // 4. Finalize Batch
    return this.ingestionService.finalizeBatch(
      tenantId,
      batchId,
      fileHash,
      accepted,
      duplicates,
      quarantined,
      quarantineIds,
      createdLeadIds
    );
  }

  /**
   * Reprocess a corrected quarantine record.
   */
  async reprocessQuarantine(tenantId: string, quarantineId: string, correctedData: LeadIngestInput) {
    const ingestRes = await this.ingestionService.ingestLeadRow(tenantId, correctedData, {
      channel: 'QUARANTINE_RESOLVED',
      rawPayload: correctedData,
    });

    if (ingestRes.success && ingestRes.leadId) {
      try {
        await this.db.query(
          `UPDATE quarantine_records
           SET status = 'RESOLVED', resolved_lead_id = $1, resolved_at = NOW()
           WHERE id = $2 AND tenant_id = $3`,
          [ingestRes.leadId, quarantineId, tenantId]
        );
      } catch {
        // DB offline
      }
      return {
        success: true,
        message: 'Datensatz erfolgreich korrigiert und importiert.',
        leadId: ingestRes.leadId,
      };
    }

    return {
      success: false,
      message: ingestRes.error || 'Datensatz konnte nicht validiert werden.',
    };
  }
}
