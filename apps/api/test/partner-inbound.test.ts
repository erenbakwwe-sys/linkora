import { validateInboundLead } from '../src/modules/partner-inbound/inbound.validation.js';
import { PartnerInboundService } from '../src/modules/partner-inbound/partner-inbound.service.js';

const treppenlift = {
  externalId: 'crm-48213',
  kategorie: 'TREPPENLIFT',
  anrede: 'FRAU',
  vorname: 'Erika',
  nachname: 'Muster',
  telefon: '0171 2345678',
  email: 'erika@example.de',
  strasse: 'Hauptstraße',
  hausnummer: '12a',
  plz: '80331',
  ort: 'München',
  liftTyp: 'SITZLIFT',
  treppenform: 'KURVIG',
  innenAussen: 'INNEN',
  etagen: 1,
  nutzer: 'SELBST',
  eigentuemer: 'EIGENTUM',
  zeitrahmen: 'M1_3',
  pflegegrad: 'PG2',
  datenschutzOk: true,
  kontaktWunsch: 'TELEFON',
  rueckrufVon: '2026-12-01T10:00',
  rueckrufBis: '2026-12-01T12:00',
};

const hausnotruf = {
  externalId: 'crm-48214',
  kategorie: 'HAUSNOTRUF',
  anrede: 'HERR',
  vorname: 'Hans',
  nachname: 'Beispiel',
  telefon: '030 1234567',
  strasse: 'Lindenweg',
  hausnummer: '3',
  plz: '10115',
  ort: 'Berlin',
  pflegegrad: 'PG3',
  hausnotrufBedarf: true,
  krankenkasse: 'AOK Nordost',
  datenschutzOk: true,
  kontaktWunsch: 'TELEFON',
};

describe('Partner Lead-API validation', () => {
  it('accepts the documented Treppenlift and Hausnotruf examples', () => {
    expect(validateInboundLead(treppenlift).ok).toBe(true);
    expect(validateInboundLead(hausnotruf).ok).toBe(true);
  });

  it('ignores Treppenlift fields for Hausnotruf', () => {
    const r = validateInboundLead({ ...hausnotruf, liftTyp: 'QUATSCH' });
    expect(r.ok).toBe(true);
  });

  it('reports missing and invalid fields like the documented 422 response', () => {
    const r = validateInboundLead({ ...treppenlift, plz: '8033', datenschutzOk: false, etagen: 12, liftTyp: 'RAKETE', anrede: undefined });
    expect(r.ok).toBe(false);
    if (r.ok === false) {
      expect(Object.keys(r.fieldErrors).sort()).toEqual(['anrede', 'datenschutzOk', 'etagen', 'liftTyp', 'plz']);
    }
  });

  it('requires hausnotrufBedarf and krankenkasse for Hausnotruf', () => {
    const r = validateInboundLead({ ...hausnotruf, hausnotrufBedarf: false, krankenkasse: '' });
    expect(r.ok === false && Object.keys(r.fieldErrors).sort()).toEqual(['hausnotrufBedarf', 'krankenkasse']);
  });

  it('rejects invalid externalId and callback times', () => {
    const r = validateInboundLead({ ...treppenlift, externalId: 'mit leerzeichen', rueckrufVon: undefined });
    expect(r.ok === false && Object.keys(r.fieldErrors).sort()).toEqual(['externalId', 'rueckrufBis']);
  });
});

describe('Partner Lead-API authentication', () => {
  const svc = new PartnerInboundService({} as any, {} as any);
  afterEach(() => delete process.env.INBOUND_PARTNER_KEYS);

  it('accepts only configured keys', () => {
    process.env.INBOUND_PARTNER_KEYS = JSON.stringify([{ name: 'Partner A', key: 'lk_live_partner_a_0123456789' }]);
    expect(svc.authenticate('Bearer lk_live_partner_a_0123456789')?.name).toBe('Partner A');
    expect(svc.authenticate('Bearer lk_live_partner_a_0123456780')).toBeNull();
    expect(svc.authenticate('lk_live_partner_a_0123456789')).toBeNull();
    expect(svc.authenticate(undefined)).toBeNull();
  });

  it('limits to 60 leads per minute', () => {
    const partner = { name: 'Rate', tenantId: 't' };
    for (let i = 0; i < 60; i++) expect(svc.isRateLimited(partner)).toBe(false);
    expect(svc.isRateLimited(partner)).toBe(true);
  });
});
