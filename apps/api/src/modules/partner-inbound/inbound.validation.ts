/**
 * Validation of partner leads sent to POST /api/leads/inbound.
 * Field names and rules follow the published Lead-API format (same as Hyperion's), so partners
 * that already export in that format can send without changes.
 */
import { HYPERION_ENUMS } from '../integrations/hyperion/hyperion.payload.js';

export const INBOUND_PROJECTS = {
  TREPPENLIFT: 'cccccccc-0000-0000-0000-000000000003',
  HAUSNOTRUF: 'cccccccc-0000-0000-0000-000000000006',
} as const;

export type InboundKategorie = keyof typeof INBOUND_PROJECTS;

export interface ValidInboundLead {
  externalId: string | null;
  kategorie: InboundKategorie;
  anrede: string;
  vorname: string;
  nachname: string;
  telefon: string;
  email: string | null;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  pflegegrad: string;
  kontaktWunsch: string;
  besteErreichbarkeit?: string;
  rueckrufVon?: string;
  rueckrufBis?: string;
  geburtsdatum?: string;
  notizen?: string;
  treppenlift?: {
    liftTyp: string;
    treppenform: string;
    innenAussen: string;
    etagen: number;
    nutzer: string;
    eigentuemer: string;
    zeitrahmen: string;
    zeitrahmenText?: string;
    haustyp?: string;
    entscheider?: string;
  };
  hausnotruf?: { hausnotrufBedarf: true; krankenkasse: string };
}

const EXTERNAL_ID_RE = /^[A-Za-z0-9._:-]{1,100}$/;
const DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (v: unknown) => (typeof v === 'string' ? v.trim() : typeof v === 'number' ? String(v) : '');

export function validateInboundLead(
  body: unknown,
): { ok: true; lead: ValidInboundLead } | { ok: false; fieldErrors: Record<string, string> } {
  const e: Record<string, string> = {};
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, fieldErrors: { _: 'JSON-Objekt erwartet' } };
  }
  const b = body as Record<string, any>;

  const oneOf = (key: string, allowed: readonly string[], required = true) => {
    const v = str(b[key]);
    if (!v) {
      if (required) e[key] = 'Pflichtfeld fehlt';
    } else if (!allowed.includes(v)) {
      e[key] = `Ungültiger Wert (erlaubt: ${allowed.join(', ')})`;
    }
    return v;
  };
  const text = (key: string, required = true, max = 200) => {
    const v = str(b[key]);
    if (!v && required) e[key] = 'Pflichtfeld fehlt';
    else if (v.length > max) e[key] = `Maximal ${max} Zeichen`;
    return v;
  };

  const externalIdRaw = str(b.externalId);
  if (externalIdRaw && !EXTERNAL_ID_RE.test(externalIdRaw)) {
    e.externalId = 'Max. 100 Zeichen, nur A–Z a–z 0–9 . _ : -';
  }

  const kategorie = oneOf('kategorie', ['TREPPENLIFT', 'HAUSNOTRUF']) as InboundKategorie;
  const anrede = oneOf('anrede', HYPERION_ENUMS.anrede);
  const vorname = text('vorname', true, 100);
  const nachname = text('nachname', true, 100);
  const telefon = text('telefon', true, 50);
  if (telefon && (telefon.match(/\d/g) || []).length < 6) e.telefon = 'Mindestens 6 Ziffern';
  const email = text('email', false, 255);
  if (email && !EMAIL_RE.test(email)) e.email = 'Ungültige E-Mail';
  const strasse = text('strasse', true, 150);
  const hausnummer = text('hausnummer', true, 20);
  const ort = text('ort', true, 100);
  const plz = str(b.plz);
  if (!plz) e.plz = 'Pflichtfeld fehlt';
  else if (!/^\d{5}$/.test(plz)) e.plz = 'PLZ unbekannt (5-stellige deutsche PLZ)';
  const pflegegrad = oneOf('pflegegrad', HYPERION_ENUMS.pflegegrad);
  if (b.datenschutzOk !== true) e.datenschutzOk = 'Muss true sein (Einwilligung des Kunden)';
  const kontaktWunsch = oneOf('kontaktWunsch', HYPERION_ENUMS.kontaktWunsch);

  const besteErreichbarkeit = text('besteErreichbarkeit', false, 500);
  const rueckrufVon = str(b.rueckrufVon);
  const rueckrufBis = str(b.rueckrufBis);
  if (rueckrufVon && !DATETIME_RE.test(rueckrufVon)) e.rueckrufVon = 'Format YYYY-MM-DDTHH:MM';
  if (rueckrufBis && !DATETIME_RE.test(rueckrufBis)) e.rueckrufBis = 'Format YYYY-MM-DDTHH:MM';
  if (rueckrufBis && !rueckrufVon) e.rueckrufBis = 'Nur zusammen mit rueckrufVon';
  const geburtsdatum = str(b.geburtsdatum);
  if (geburtsdatum && !DATE_RE.test(geburtsdatum)) e.geburtsdatum = 'Format YYYY-MM-DD';
  const notizen = str(b.notizen);
  if (notizen.length > 5000) e.notizen = 'Maximal 5000 Zeichen';

  let treppenlift: ValidInboundLead['treppenlift'];
  let hausnotruf: ValidInboundLead['hausnotruf'];
  if (kategorie === 'TREPPENLIFT') {
    const etagen = Number(b.etagen);
    if (!Number.isInteger(etagen) || etagen < 1 || etagen > 10) e.etagen = 'Zahl 1–10';
    treppenlift = {
      liftTyp: oneOf('liftTyp', HYPERION_ENUMS.liftTyp),
      treppenform: oneOf('treppenform', HYPERION_ENUMS.treppenform),
      innenAussen: oneOf('innenAussen', HYPERION_ENUMS.innenAussen),
      etagen,
      nutzer: oneOf('nutzer', HYPERION_ENUMS.nutzer),
      eigentuemer: oneOf('eigentuemer', HYPERION_ENUMS.eigentuemer),
      zeitrahmen: oneOf('zeitrahmen', HYPERION_ENUMS.zeitrahmen),
      zeitrahmenText: text('zeitrahmenText', false, 500) || undefined,
      haustyp: text('haustyp', false, 200) || undefined,
      entscheider: text('entscheider', false, 200) || undefined,
    };
  } else if (kategorie === 'HAUSNOTRUF') {
    if (b.hausnotrufBedarf !== true) e.hausnotrufBedarf = 'Muss true sein';
    const krankenkasse = text('krankenkasse', true, 200);
    hausnotruf = { hausnotrufBedarf: true, krankenkasse };
  }

  if (Object.keys(e).length > 0) return { ok: false, fieldErrors: e };

  return {
    ok: true,
    lead: {
      externalId: externalIdRaw || null,
      kategorie,
      anrede,
      vorname,
      nachname,
      telefon,
      email: email || null,
      strasse,
      hausnummer,
      plz,
      ort,
      pflegegrad,
      kontaktWunsch,
      besteErreichbarkeit: besteErreichbarkeit || undefined,
      rueckrufVon: rueckrufVon || undefined,
      rueckrufBis: rueckrufBis || undefined,
      geburtsdatum: geburtsdatum || undefined,
      notizen: notizen || undefined,
      treppenlift,
      hausnotruf,
    },
  };
}

/** Status names used in the API responses (German, as in the published format). */
export function publicStatus(status: string): string {
  const map: Record<string, string> = {
    NEW: 'NEU',
    QC_PENDING: 'IN_QC',
    IN_REVIEW: 'IN_PRUEFUNG',
    CONFIRMED: 'BESTAETIGT',
    ROUTED: 'GESENDET',
    SOLD: 'VERKAUFT',
    STORNO: 'STORNO',
    REJECTED: 'ABGELEHNT',
    RETURNED: 'RETOURE',
  };
  return map[status] || status;
}
