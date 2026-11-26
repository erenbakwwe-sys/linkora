/**
 * Mapping of a Linkora lead to the Hyperion Leads Panel "Lead-API" payload
 * (POST https://hyperionleadspanel.online/api/leads/inbound).
 *
 * Pure functions only, so the mapping and validation can be unit-tested without HTTP/DB.
 */

export const TREPPENLIFT_PROJECT_ID = 'cccccccc-0000-0000-0000-000000000003';

export const HYPERION_ENUMS = {
  anrede: ['HERR', 'FRAU', 'KEINE_ANGABE'],
  pflegegrad: ['KEIN', 'PG1', 'PG2', 'PG3', 'PG4', 'PG5', 'BEANTRAGT'],
  kontaktWunsch: ['TELEFON', 'EMAIL', 'BEIDES'],
  liftTyp: ['SITZLIFT', 'PLATTFORMLIFT', 'HUBLIFT', 'UNBEKANNT'],
  treppenform: ['GERADE', 'KURVIG', 'MEHRERE_ETAGEN', 'WENDELTREPPE', 'UNKLAR'],
  innenAussen: ['INNEN', 'AUSSEN', 'INNEN_UND_AUSSEN'],
  nutzer: ['SELBST', 'ANGEHOERIGER'],
  eigentuemer: ['EIGENTUM', 'MIETE'],
  zeitrahmen: ['SOFORT', 'M1_3', 'M3_6', 'SPAETER', 'UNKLAR'],
} as const;

/** Lead-specific Hyperion answers, stored in `leads.extra_data.hyperion`. */
export interface HyperionLeadData {
  anrede?: string;
  pflegegrad?: string;
  kontaktWunsch?: string;
  besteErreichbarkeit?: string;
  rueckrufVon?: string;
  rueckrufBis?: string;
  geburtsdatum?: string;
  notizen?: string;
  liftTyp?: string;
  treppenform?: string;
  innenAussen?: string;
  etagen?: number | string;
  nutzer?: string;
  eigentuemer?: string;
  zeitrahmen?: string;
  zeitrahmenText?: string;
  haustyp?: string;
  entscheider?: string;
}

export interface HyperionPayload {
  externalId: string;
  kategorie: 'TREPPENLIFT';
  anrede: string;
  vorname: string;
  nachname: string;
  telefon: string;
  email?: string;
  strasse: string;
  hausnummer: string;
  plz: string;
  ort: string;
  pflegegrad: string;
  datenschutzOk: true;
  kontaktWunsch: string;
  besteErreichbarkeit?: string;
  rueckrufVon?: string;
  rueckrufBis?: string;
  geburtsdatum?: string;
  notizen?: string;
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
}

export type FieldErrors = Record<string, string>;

const EXTERNAL_ID_RE = /^[A-Za-z0-9._:-]{1,100}$/;
const DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : v === null || v === undefined ? '' : String(v).trim();
}

export function isTreppenliftLead(lead: any): boolean {
  if (!lead) return false;
  const slug = str(lead.project_slug || lead.projectSlug).toLowerCase();
  const name = str(lead.project_name || lead.projectName).toLowerCase();
  return (
    lead.project_id === TREPPENLIFT_PROJECT_ID ||
    lead.projectId === TREPPENLIFT_PROJECT_ID ||
    slug.includes('treppenlift') ||
    name.includes('treppenlift')
  );
}

/**
 * Splits "Hauptstraße 12a" into street + house number when no separate house number is stored.
 */
export function splitStreet(street: string, houseNumber: string): { strasse: string; hausnummer: string } {
  const s = str(street);
  const h = str(houseNumber);
  if (h) return { strasse: s, hausnummer: h };
  const m = s.match(/^(.*\S)\s+(\d+\s*[a-zA-Z]?(?:\s*[-/]\s*\d+\s*[a-zA-Z]?)?)$/);
  if (m) return { strasse: m[1].trim(), hausnummer: m[2].replace(/\s+/g, '') };
  return { strasse: s, hausnummer: '' };
}

/** Builds and validates the Hyperion payload. Errors mirror Hyperion's own 422 field errors. */
export function buildHyperionPayload(lead: any): { payload: HyperionPayload | null; fieldErrors: FieldErrors } {
  const errors: FieldErrors = {};
  const extra = (lead?.extra_data || lead?.extraData || {}) as Record<string, any>;
  const h: HyperionLeadData = (extra.hyperion || {}) as HyperionLeadData;

  const externalId = str(lead?.id);
  if (!EXTERNAL_ID_RE.test(externalId)) errors.externalId = 'Ungültige Lead-ID';

  if (!isTreppenliftLead(lead)) {
    errors.kategorie = 'Nur Treppenlift-Leads können an Hyperion gesendet werden';
  }

  const enumField = (key: keyof typeof HYPERION_ENUMS, value: unknown, label: string): string => {
    const v = str(value);
    if (!v) {
      errors[key] = `${label} fehlt`;
    } else if (!(HYPERION_ENUMS[key] as readonly string[]).includes(v)) {
      errors[key] = `${label}: ungültiger Wert "${v}"`;
    }
    return v;
  };

  const required = (key: string, value: unknown, label: string): string => {
    const v = str(value);
    if (!v) errors[key] = `${label} fehlt`;
    return v;
  };

  const anrede = enumField('anrede', h.anrede || extra.anrede, 'Anrede');
  const vorname = required('vorname', lead?.first_name, 'Vorname');
  const nachname = required('nachname', lead?.last_name, 'Nachname');

  const telefon = str(lead?.phone_raw || lead?.phone_e164);
  if ((telefon.match(/\d/g) || []).length < 6) errors.telefon = 'Telefonnummer muss mind. 6 Ziffern haben';

  const email = str(lead?.email);
  if (email && !EMAIL_RE.test(email)) errors.email = 'Ungültige E-Mail';

  const { strasse, hausnummer } = splitStreet(lead?.street, lead?.house_number);
  if (!strasse) errors.strasse = 'Straße fehlt';
  if (!hausnummer) errors.hausnummer = 'Hausnummer fehlt';

  const plz = str(lead?.postal_code);
  if (!/^\d{5}$/.test(plz)) errors.plz = 'PLZ muss 5-stellig sein';
  const ort = required('ort', lead?.city, 'Ort');

  const pflegegrad = enumField('pflegegrad', h.pflegegrad, 'Pflegegrad');
  const kontaktWunsch = enumField('kontaktWunsch', h.kontaktWunsch, 'Kontaktwunsch');

  const consent = lead?.consent_verified === true || lead?.consentVerified === true;
  if (!consent) errors.datenschutzOk = 'Keine nachgewiesene Einwilligung des Kunden';

  const liftTyp = enumField('liftTyp', h.liftTyp, 'Lift-Typ');
  const treppenform = enumField('treppenform', h.treppenform, 'Treppenform');
  const innenAussen = enumField('innenAussen', h.innenAussen, 'Innen/Außen');
  const nutzer = enumField('nutzer', h.nutzer, 'Nutzer');
  const eigentuemer = enumField('eigentuemer', h.eigentuemer, 'Eigentümer');
  const zeitrahmen = enumField('zeitrahmen', h.zeitrahmen, 'Zeitrahmen');

  const etagen = Number(h.etagen);
  if (!Number.isInteger(etagen) || etagen < 1 || etagen > 10) errors.etagen = 'Etagen muss eine Zahl von 1 bis 10 sein';

  const rueckrufVon = str(h.rueckrufVon);
  const rueckrufBis = str(h.rueckrufBis);
  if (rueckrufVon && !DATETIME_RE.test(rueckrufVon)) errors.rueckrufVon = 'Format YYYY-MM-DDTHH:MM';
  if (rueckrufBis && !DATETIME_RE.test(rueckrufBis)) errors.rueckrufBis = 'Format YYYY-MM-DDTHH:MM';
  if (rueckrufBis && !rueckrufVon) errors.rueckrufBis = 'Nur zusammen mit rueckrufVon';

  const geburtsdatum = str(h.geburtsdatum);
  if (geburtsdatum && !DATE_RE.test(geburtsdatum)) errors.geburtsdatum = 'Format YYYY-MM-DD';

  const notizen = str(h.notizen || extra.notizen || extra.notes).slice(0, 5000);

  if (Object.keys(errors).length > 0) {
    return { payload: null, fieldErrors: errors };
  }

  const payload: HyperionPayload = {
    externalId,
    kategorie: 'TREPPENLIFT',
    anrede,
    vorname,
    nachname,
    telefon,
    strasse,
    hausnummer,
    plz,
    ort,
    pflegegrad,
    datenschutzOk: true,
    kontaktWunsch,
    liftTyp,
    treppenform,
    innenAussen,
    etagen,
    nutzer,
    eigentuemer,
    zeitrahmen,
  };

  const optional: Partial<HyperionPayload> = {
    email: email || undefined,
    besteErreichbarkeit: str(h.besteErreichbarkeit) || undefined,
    rueckrufVon: rueckrufVon || undefined,
    rueckrufBis: rueckrufBis || undefined,
    geburtsdatum: geburtsdatum || undefined,
    notizen: notizen || undefined,
    zeitrahmenText: str(h.zeitrahmenText) || undefined,
    haustyp: str(h.haustyp) || undefined,
    entscheider: str(h.entscheider) || undefined,
  };
  for (const [k, v] of Object.entries(optional)) {
    if (v !== undefined) (payload as any)[k] = v;
  }

  return { payload, fieldErrors: {} };
}
