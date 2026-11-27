import { answerKey, buildVipCallPayload } from '../src/modules/marketplace/vipcall.payload.js';
import { VipCallDeliveryService } from '../src/modules/marketplace/vipcall-delivery.service.js';

const leadRow = () => ({
  id: '6a1cb962-0fdf-4c9c-bfb5-6f5d0921f543',
  project_id: 'cccccccc-0000-0000-0000-000000000003',
  project_slug: 'treppenlift',
  project_name: 'Treppenlift',
  first_name: 'Erika',
  last_name: 'Muster',
  phone_e164: '+491712345678',
  email: 'erika@example.de',
  street: 'Hauptstraße',
  house_number: '12a',
  postal_code: '80331',
  city: 'München',
  consent_verified: true,
  dnc_flag: false,
  created_at: '2026-11-27T10:00:00Z',
  extra_data: {
    partner: 'Partner GmbH',
    externalId: 'crm-48213',
    hyperion: { anrede: 'FRAU', liftTyp: 'SITZLIFT', zeitrahmen: 'M1_3', eigentuemer: 'EIGENTUM', treppenform: 'KURVIG', innenAussen: 'INNEN', etagen: 1, nutzer: 'SELBST', pflegegrad: 'PG2', notizen: 'Treppe mit Podest' },
  },
});

describe('VIP Call payload (Aroundhome)', () => {
  it('builds the VIP Call format for a Treppenlift partner lead', () => {
    const { payload, errors } = buildVipCallPayload(leadRow(), [{ source: 'Partner-API: Partner GmbH', opt_in_timestamp: '2026-11-27T09:00:00Z' }]);
    expect(errors).toEqual({});
    expect(payload).toMatchObject({
      external_id: 'LNK-6a1cb962-0fdf-4c9c-bfb5-6f5d0921f543',
      product: 'tb',
      customer: { first_name: 'Erika', last_name: 'Muster', street: 'Hauptstraße 12a', zip: '80331', city: 'München', phone: '+491712345678', email: 'erika@example.de' },
      answers: {
        anrede: 'Frau',
        was_fuer_einen_lift_suchen_sie: expect.stringContaining('Sitzlift'),
        wann_wird_der_lift_benoetigt: 'In 1-3 Monaten',
        sind_sie_eigentuemer_entscheider: 'Ja',
      },
      consent: { contact: true, recording: false, source: 'Partner-API: Partner GmbH' },
    });
    expect(payload!.customer.note).toContain('Treppe mit Podest');
    expect(payload!.customer.note).toContain('Pflegegrad 2');
  });

  it('never fills in placeholder data – incomplete leads are rejected', () => {
    const lead: any = leadRow();
    lead.phone_e164 = '';
    lead.street = '';
    lead.house_number = '';
    lead.consent_verified = false;
    const { payload, errors } = buildVipCallPayload(lead);
    expect(payload).toBeNull();
    expect(Object.keys(errors).sort()).toEqual(['consent', 'phone', 'street']);
  });

  it('rejects projects VIP Call does not accept (e.g. Hausnotruf)', () => {
    const lead: any = { ...leadRow(), project_slug: 'hausnotruf', project_id: 'cccccccc-0000-0000-0000-000000000006', project_name: 'Hausnotruf' };
    expect(buildVipCallPayload(lead).errors.product).toBeDefined();
  });

  it('creates VIP Call answer keys from question labels', () => {
    expect(answerKey('Wie alt ist Ihr Dach?')).toBe('wie_alt_ist_ihr_dach');
    expect(answerKey('Handelt es sich bei dem Interessenten um den Eigentümer/Entscheider?')).toBe('handelt_es_sich_bei_dem_interessenten_um_den_eigen');
  });
});

describe('VipCallDeliveryService', () => {
  const realFetch = global.fetch;
  let stored: any[] = [];
  const db = {
    query: jest.fn(async (sql: string, params: any[] = []) => {
      if (sql.includes('FROM leads l LEFT JOIN projects')) return { rows: [leadRow()] };
      if (sql.includes('FROM lead_provenance')) return { rows: [] };
      if (sql.startsWith('UPDATE leads')) stored.push(JSON.parse(params[0]));
      return { rows: [] };
    }),
  } as any;
  const svc = new VipCallDeliveryService(db);
  const id = leadRow().id;

  beforeEach(() => {
    stored = [];
    process.env.VIPCALL_API_KEY = 'lk_test_dummy';
  });
  afterEach(() => {
    global.fetch = realFetch;
    delete process.env.VIPCALL_API_KEY;
  });

  it('reports network errors as failures (no simulated success)', async () => {
    global.fetch = jest.fn(async () => {
      throw new Error('ECONNREFUSED');
    }) as any;
    const r = await svc.deliver('t1', id);
    expect(r.ok).toBe(false);
    expect(stored[0].ok).toBe(false);
  });

  it('reports a rejection by VIP Call as failure', async () => {
    global.fetch = jest.fn(async () => ({ ok: false, status: 422, text: async () => '{"error":"invalid"}' })) as any;
    const r = await svc.deliver('t1', id);
    expect(r).toMatchObject({ ok: false, httpStatus: 422 });
  });

  it('sends with the API key and records the successful delivery', async () => {
    global.fetch = jest.fn(async () => ({ ok: true, status: 201, text: async () => '{"lead_id":"V-1"}' })) as any;
    const r = await svc.deliver('t1', id);
    expect(r).toMatchObject({ ok: true, httpStatus: 201 });
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.headers.Authorization).toBe('Bearer lk_test_dummy');
    expect(JSON.parse(init.body).product).toBe('tb');
    expect(stored[0]).toMatchObject({ ok: true, externalId: `LNK-${id}` });
  });
});
