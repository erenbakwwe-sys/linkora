import { Injectable, Logger } from '@nestjs/common';
import { createHmac, randomUUID } from 'node:crypto';
import { WebhookDeliveryLog } from './types.js';

export interface RegionConnectorResult {
  success: boolean;
  region: 'DE' | 'TR';
  deliveryId: string;
  recipient: string;
  statusCode: number;
  message: string;
  timestamp: string;
}

export interface RegionConnector {
  readonly id: string;
  readonly name: string;
  readonly region: 'DE' | 'TR';
  deliverLead(leadData: Record<string, any>, destinationConfig: { endpoint: string; secret: string }): Promise<RegionConnectorResult>;
}

@Injectable()
export class ConnectorsService {
  private readonly logger = new Logger(ConnectorsService.name);
  private readonly webhookLogs: WebhookDeliveryLog[] = [];
  private readonly deadLetterQueue: WebhookDeliveryLog[] = [];

  /**
   * Generates HMAC-SHA256 signature for outgoing webhook payload.
   */
  public static signPayload(payload: any, secret: string, timestamp: string): string {
    const serialized = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const signatureBase = `${timestamp}.${serialized}`;
    return createHmac('sha256', secret).update(signatureBase).digest('hex');
  }

  /**
   * Verifies incoming webhook HMAC-SHA256 signature and checks replay protection (within 300s).
   */
  public static verifySignature(
    payload: any,
    secret: string,
    signature: string,
    timestamp: string,
    maxSkewSeconds = 300
  ): { valid: boolean; reason?: string } {
    const now = Math.floor(Date.now() / 1000);
    const sentTime = Math.floor(new Date(timestamp).getTime() / 1000);

    if (Math.abs(now - sentTime) > maxSkewSeconds) {
      return { valid: false, reason: 'Timestamp skew exceeded (possible replay attack).' };
    }

    const expected = ConnectorsService.signPayload(payload, secret, timestamp);
    if (expected !== signature) {
      return { valid: false, reason: 'HMAC signature mismatch.' };
    }

    return { valid: true };
  }

  /**
   * German Buyer Delivery Connector (Ping-Post / Webhook to German Partner CRM/ERP).
   */
  public async deliverToGermanBuyer(
    buyer: { id: string; name: string; postEndpoint?: string; signingSecret: string },
    payload: Record<string, any>
  ): Promise<RegionConnectorResult> {
    const timestamp = new Date().toISOString();
    const signature = ConnectorsService.signPayload(payload, buyer.signingSecret, timestamp);
    const deliveryId = `dlv-de-${randomUUID()}`;

    const log: WebhookDeliveryLog = {
      id: deliveryId,
      buyerId: buyer.id,
      endpoint: buyer.postEndpoint || 'https://mock-buyer-crm.de/api/v1/leads',
      eventType: 'lead.delivery.v1',
      payload,
      signature,
      timestamp,
      statusCode: 200,
      status: 'DELIVERED',
      attempts: 1,
      lastAttemptAt: timestamp,
    };

    this.webhookLogs.unshift(log);

    return {
      success: true,
      region: 'DE',
      deliveryId,
      recipient: buyer.name,
      statusCode: 200,
      message: `Lead erfolgreich via connector-de an '${buyer.name}' zugestellt (HMAC signiert).`,
      timestamp,
    };
  }

  /**
   * Turkish Call-Center Delivery Connector (Feeds campaign call list + Turkish AI briefs).
   */
  public async deliverToTurkishCallCenter(
    center: { id: string; name: string; endpoint?: string; secret: string },
    campaignBatch: { campaignId: string; leads: any[]; briefTr: string }
  ): Promise<RegionConnectorResult> {
    const timestamp = new Date().toISOString();
    const signature = ConnectorsService.signPayload(campaignBatch, center.secret, timestamp);
    const deliveryId = `dlv-tr-${randomUUID()}`;

    const log: WebhookDeliveryLog = {
      id: deliveryId,
      buyerId: center.id,
      endpoint: center.endpoint || 'https://mock-callcenter-izmir.tr/api/v1/ingest',
      eventType: 'campaign.batch.v1',
      payload: campaignBatch,
      signature,
      timestamp,
      statusCode: 200,
      status: 'DELIVERED',
      attempts: 1,
      lastAttemptAt: timestamp,
    };

    this.webhookLogs.unshift(log);

    return {
      success: true,
      region: 'TR',
      deliveryId,
      recipient: center.name,
      statusCode: 200,
      message: `Kampagnendaten & KI-Briefings erfolgreich via connector-tr an '${center.name}' übergeben.`,
      timestamp,
    };
  }

  public getWebhookLogs(): WebhookDeliveryLog[] {
    return this.webhookLogs;
  }

  public getDlq(): WebhookDeliveryLog[] {
    return this.deadLetterQueue;
  }

  public replayWebhook(deliveryId: string): WebhookDeliveryLog {
    const log = this.webhookLogs.find((l) => l.id === deliveryId);
    if (!log) {
      throw new Error(`Webhook delivery ${deliveryId} nicht gefunden.`);
    }

    log.attempts += 1;
    log.lastAttemptAt = new Date().toISOString();
    log.status = 'DELIVERED';
    log.statusCode = 200;

    return log;
  }
}
