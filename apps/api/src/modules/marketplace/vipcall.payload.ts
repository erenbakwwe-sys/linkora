/**
 * Builds the VIP Call Dialer lead payload (POST https://vipcalldailer.com/api/v1/leads), through
 * which leads are forwarded to Aroundhome. Format as used by scripts/submit-test-leads.mjs:
 *   { external_id, product, customer{first_name,last_name,street,zip,city,phone,email,note},
 *     answers{...}, consent{...}, agent{...}, recording_url }
 *
 * Pure function: missing data is reported as errors – never replaced by placeholder values.
 */

const PRODUCT_BY_SLUG: Record<string, string> = {
  photovoltaik: 'pv',
  waermepumpe: 'wp',
  treppenlift: 'tb',
  badsanierung: 'bad',
  elektromobil: 'em',
};

const PRODUCT_BY_PROJECT_ID: Record<string, string> = {
  'cccccccc-0000-0000-0000-000000000001': 'pv',
  'cccccccc-0000-0000-0000-000000000002': 'wp',
  'cccccccc-0000-0000-0000-000000000003': 'tb',
  'cccccccc-0000-0000-0000-000000000004': 'bad',
  'cccccccc-0000-0000-0000-000000000005': 'em',
};

const ANREDE: Record<string, string> = { HERR: 'Herr', FRAU: 'Frau', Herr: 'Herr', Frau: 'Frau' };

const TB_LIFT: Record<string, string> = {
  SITZLIFT: 'Sitzlift (Beliebteste Lösung, Transport über Schienensystem an der Treppe)',
  PLATTFORMLIFT: 'Plattformlift',
  HUBLIFT: 'Hublift',
  UNBEKANNT: 'Weiß nicht',
};
const TB_ZEIT: Record<string, string> = {
  SOFORT: 'Sofort',
  M1_3: 'In 1-3 Monaten',
  M3_6: 'In 3-6 Monaten',
  SPAETER: 'Später',
  UNKLAR: 'Weiß nicht',
};
const TB_TREPPE: Record<string, string> = {
  GERADE: 'gerade',
  KURVIG: 'kurvig',
  MEHRERE_ETAGEN: 'über mehrere Etagen',
  WENDELTREPPE: 'Wendeltreppe',
  UNKLAR: 'unklar',
};
const INNEN_AUSSEN: Record<string, string> = { INNEN: 'innen', AUSSEN: 'außen', INNEN_UND_AUSSEN: 'innen und außen' };
const PFLEGEGRAD: Record<string, string> = {
  KEIN: 'kein Pflegegrad',
  PG1: 'Pflegegrad 1',
  PG2: 'Pflegegrad 2',
  PG3: 'Pflegegrad 3',
  PG4: 'Pflegegrad 4',
  PG5: 'Pflegegrad 5',
  BEANTRAGT: 'Pflegegrad beantragt',
};
const NUTZER: Record<string, string> = { SELBST: 'für sich selbst', ANGEHOERIGER: 'für einen Angehörigen' };

/** Same key style VIP Call uses for questionnaire answers ("wie_alt_ist_ihr_dach"). */
export function answerKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 50);
}

const s = (v: unknown) => (typeof v === 'string' ? v.trim() : v === null || v === undefined ? '' : String(v).trim());

export interface VipCallPayload {
  external_id: string;
  product: string;
  customer: Record<string, string>;
  answers: Record<string, string | number>;
  consent: Record<string, any>;
  agent?: Record<string, string>;
  recording_url?: string;
}

export function buildVipCallPayload(
  lead: any,
  provenance: any[] = [],
): { payload: VipCallPayload | null; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const extra = (lead?.extra_data || {}) as Record<string, any>;
  const h = (extra.hyperion || {}) as Record<string, any>;

  const product = PRODUCT_BY_SLUG[s(lead?.project_slug)] || PRODUCT_BY_PROJECT_ID[s(lead?.project_id)];
  if (!product) errors.product = `Projekt "${lead?.project_name || '?'}" wird von Aroundhome/VIP Call nicht angenommen`;

  const first = s(lead?.first_name);
  const last = s(lead?.last_name);
  const phone = s(lead?.phone_e164 || lead?.phone_raw);
  const zip = s(lead?.postal_code);
  const city = s(lead?.city);
  const street = [s(lead?.street), s(lead?.house_number)].filter(Boolean).join(' ');
  if (!first) errors.first_name = 'Vorname fehlt';
  if (!last) errors.last_name = 'Nachname fehlt';
  if ((phone.match(/\d/g) || []).length < 6) errors.phone = 'Telefonnummer fehlt';
  if (!/^\d{5}$/.test(zip)) errors.zip = 'PLZ fehlt oder ist ungültig';
  if (!city) errors.city = 'Ort fehlt';
  if (!street) errors.street = 'Straße fehlt';
  if (lead?.consent_verified !== true) errors.consent = 'Keine nachgewiesene Einwilligung';
  if (lead?.dnc_flag === true) errors.dnc = 'Kunde steht auf der Sperrliste (DNC)';

  const noteParts: string[] = [];
  const notes = s(extra.notes || h.notizen);
  if (notes) noteParts.push(notes);

  const answers: Record<string, string | number> = {};
  const anrede = ANREDE[s(h.anrede || extra.anrede)];
  if (anrede) answers.anrede = anrede;

  // Questionnaire answers captured in the agent form (labels -> VIP Call keys)
  if (Array.isArray(extra.formattedAnswers)) {
    for (const a of extra.formattedAnswers) {
      if (a?.question_label && s(a.value_raw)) answers[answerKey(a.question_label)] = s(a.value_raw);
    }
  }

  if (product === 'tb') {
    if (TB_LIFT[h.liftTyp]) answers.was_fuer_einen_lift_suchen_sie = TB_LIFT[h.liftTyp];
    if (TB_ZEIT[h.zeitrahmen]) answers.wann_wird_der_lift_benoetigt = TB_ZEIT[h.zeitrahmen];
    if (h.eigentuemer === 'EIGENTUM') answers.sind_sie_eigentuemer_entscheider = 'Ja';
    if (h.eigentuemer === 'MIETE') answers.sind_sie_eigentuemer_entscheider = 'Nein';
    if (s(h.haustyp)) answers.um_welchen_gebaeudetyp_handelt_es_sich = s(h.haustyp);
    const details = [
      TB_TREPPE[h.treppenform] && `Treppe ${TB_TREPPE[h.treppenform]}`,
      INNEN_AUSSEN[h.innenAussen] && `Lift ${INNEN_AUSSEN[h.innenAussen]}`,
      h.etagen && `${h.etagen} Etage(n)`,
      NUTZER[h.nutzer] && `Lift ${NUTZER[h.nutzer]}`,
      PFLEGEGRAD[h.pflegegrad],
      s(h.besteErreichbarkeit) && `Erreichbar: ${s(h.besteErreichbarkeit)}`,
      s(h.rueckrufVon) && `Rückrufwunsch: ${s(h.rueckrufVon)}${s(h.rueckrufBis) ? ' – ' + s(h.rueckrufBis) : ''}`,
    ].filter(Boolean);
    if (details.length) noteParts.push(details.join(', '));
  }

  if (Object.keys(errors).length > 0) return { payload: null, errors };

  const prov = provenance[0] || {};
  const optIn = prov.opt_in_timestamp ? new Date(prov.opt_in_timestamp).toISOString() : new Date(lead.created_at || Date.now()).toISOString();
  const recordingUrl = s(extra.recordingUrl || lead?.audio_recording_url);

  const customer: Record<string, string> = { first_name: first, last_name: last, street, zip, city, phone };
  if (s(lead?.email)) customer.email = s(lead.email);
  if (noteParts.length) customer.note = noteParts.join(' | ').slice(0, 2000);

  const payload: VipCallPayload = {
    external_id: `LNK-${lead.id}`,
    product: product!,
    customer,
    answers,
    consent: {
      recording: Boolean(recordingUrl),
      ...(recordingUrl ? { recorded_at: optIn } : {}),
      source: s(prov.source) || (extra.partner ? `Partner: ${extra.partner}` : 'Telefonat'),
      contact: true,
      contact_at: optIn,
    },
    agent: {
      name: extra.partner ? `Partner: ${extra.partner}` : 'Linkora',
      id: s(extra.createdBy) || 'LINKORA',
    },
  };
  if (recordingUrl) payload.recording_url = recordingUrl;
  return { payload, errors: {} };
}
