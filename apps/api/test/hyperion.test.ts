import { buildHyperionPayload, splitStreet, TREPPENLIFT_PROJECT_ID } from '../src/modules/integrations/hyperion/hyperion.payload.js';
import { HyperionService } from '../src/modules/integrations/hyperion/hyperion.service.js';

const completeLead = () => ({
  id: '0b6f3b1e-1111-4a4a-9c9c-123456789abc',
  project_id: TREPPENLIFT_PROJECT_ID,
  project_name: 'Treppenlift',
  first_name: 'Erika',
  last_name: 'Muster',
  phone_raw: '0171 2345678',
  phone_e164: '+491712345678',
  email: 'erika@example.de',
  street: 'Hauptstraße',
  house_number: '12a',
  postal_code: '80331',
  city: 'München',
  consent_verified: true,
  extra_data: {
    hyperion: {
      anrede: 'FRAU',
      liftTyp: 'SITZLIFT',
      treppenform: 'KURVIG',
      innenAussen: 'INNEN',
      etagen: '1',
      nutzer: 'SELBST',
      eigentuemer: 'EIGENTUM',
      zeitrahmen: 'M1_3',
      pflegegrad: 'PG2',
      kontaktWunsch: 'TELEFON',
      besteErreichbarkeit: 'vormittags',
      rueckrufVon: '2026-12-01T10:00',
      notizen: 'Treppe mit Podest',
    },
  },
});

describe('Hyperion payload mapping', () => {
  it('builds the documented Treppenlift payload', () => {
    const { payload, fieldErrors } = buildHyperionPayload(completeLead());
    expect(fieldErrors).toEqual({});
    expect(payload).toMatchObject({
      externalId: '0b6f3b1e-1111-4a4a-9c9c-123456789abc',
      kategorie: 'TREPPENLIFT',
      anrede: 'FRAU',
      telefon: '0171 2345678',
      strasse: 'Hauptstraße',
      hausnummer: '12a',
      plz: '80331',
      etagen: 1,
      datenschutzOk: true,
      rueckrufVon: '2026-12-01T10:00',
    });
    expect(payload).not.toHaveProperty('rueckrufBis');
  });

  it('reports missing required fields instead of guessing values', () => {
    const lead = completeLead();
    delete (lead.extra_data.hyperion as any).nutzer;
    delete (lead.extra_data.hyperion as any).eigentuemer;
    lead.postal_code = '8033';
    const { payload, fieldErrors } = buildHyperionPayload(lead);
    expect(payload).toBeNull();
    expect(Object.keys(fieldErrors).sort()).toEqual(['eigentuemer', 'nutzer', 'plz']);
  });

  it('rejects leads without consent and non-Treppenlift leads', () => {
    const lead: any = completeLead();
    lead.consent_verified = false;
    lead.project_id = 'cccccccc-0000-0000-0000-000000000001';
    lead.project_name = 'Photovoltaik';
    const { fieldErrors } = buildHyperionPayload(lead);
    expect(fieldErrors.datenschutzOk).toBeDefined();
    expect(fieldErrors.kategorie).toBeDefined();
  });

  it('splits a combined street + house number', () => {
    expect(splitStreet('Hauptstraße 12a', '')).toEqual({ strasse: 'Hauptstraße', hausnummer: '12a' });
    expect(splitStreet('Am Ring 3-5', '')).toEqual({ strasse: 'Am Ring', hausnummer: '3-5' });
    expect(splitStreet('Lindenweg', '')).toEqual({ strasse: 'Lindenweg', hausnummer: '' });
  });
});

describe('HyperionService.sendLead', () => {
  const realFetch = global.fetch;
  const db = { query: jest.fn(async () => ({ rows: [] })) } as any;
  const leadsService = { getLeadDetail: jest.fn(async () => ({ lead: completeLead() })) } as any;
  const service = new HyperionService(db, leadsService);
  const leadId = completeLead().id;

  beforeEach(() => {
    process.env.HYPERION_API_KEY = 'lk_test_dummy';
    db.query.mockClear();
  });
  afterEach(() => {
    global.fetch = realFetch;
    delete process.env.HYPERION_API_KEY;
  });

  it('does not send when no API key is configured', async () => {
    delete process.env.HYPERION_API_KEY;
    global.fetch = jest.fn() as any;
    const res = await service.sendLead('t1', leadId);
    expect(res).toMatchObject({ ok: false, error: 'not_configured' });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('posts with Bearer auth and stores the Hyperion id on 201', async () => {
    global.fetch = jest.fn(async () => ({
      status: 201,
      json: async () => ({ id: 'hy-1', status: 'NEU', created: true, possibleDuplicate: true }),
    })) as any;
    const res = await service.sendLead('t1', leadId, 'u1');
    expect(res).toMatchObject({ ok: true, created: true, hyperionId: 'hy-1', hyperionStatus: 'NEU', possibleDuplicate: true });
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe('https://hyperionleadspanel.online/api/leads/inbound');
    expect(init.headers.Authorization).toBe('Bearer lk_test_dummy');
    expect(JSON.parse(init.body).externalId).toBe(leadId);
    expect(db.query.mock.calls.some(([sql]: any) => String(sql).includes('hyperionDelivery'))).toBe(true);
  });

  it('treats 200 (externalId already known) as success without a new lead', async () => {
    global.fetch = jest.fn(async () => ({ status: 200, json: async () => ({ id: 'hy-1', status: 'GESENDET', created: false }) })) as any;
    const res = await service.sendLead('t1', leadId);
    expect(res).toMatchObject({ ok: true, created: false });
  });

  it('passes through Hyperion field errors on 422', async () => {
    global.fetch = jest.fn(async () => ({
      status: 422,
      json: async () => ({ error: 'validation_failed', fieldErrors: { plz: 'PLZ unbekannt' } }),
    })) as any;
    const res = await service.sendLead('t1', leadId);
    expect(res).toMatchObject({ ok: false, error: 'validation_failed', fieldErrors: { plz: 'PLZ unbekannt' } });
  });

  it('reports network failures instead of faking success', async () => {
    global.fetch = jest.fn(async () => {
      throw new Error('ECONNRESET');
    }) as any;
    const res = await service.sendLead('t1', leadId);
    expect(res).toMatchObject({ ok: false, error: 'network_error' });
  });
});
