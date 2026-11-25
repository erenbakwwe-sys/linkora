// scripts/submit-test-leads.mjs
const API_URL = 'https://vipcalldailer.com/api/v1/leads';
const API_KEY = process.env.VIPCALL_API_KEY;
if (!API_KEY) {
  console.error('VIPCALL_API_KEY environment variable is required.');
  process.exit(1);
}

async function submitLead(payload) {
  console.log(`\nSubmitting ${payload.product.toUpperCase()} Lead (${payload.external_id})...`);
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'Accept-Language': 'de'
    },
    body: JSON.stringify(payload)
  });

  const status = res.status;
  const json = await res.json();
  console.log(`Status: ${status}`);
  console.log(`Response:`, JSON.stringify(json, null, 2));
  return { status, json };
}

async function main() {
  const ts = Date.now();

  // 1. PHOTOVOLTAIK (PV)
  const pvPayload = {
    external_id: `CAL-PV-${ts}`,
    product: 'pv',
    customer: {
      first_name: 'Maximilian',
      last_name: 'Mustermann',
      street: 'Sonnenallee 42',
      zip: '80331',
      city: 'München',
      phone: '+491714567890',
      email: 'm.mustermann@calendra.de',
      note: 'Dach südausgerichtet, unverbaute Fläche'
    },
    answers: {
      anrede: 'Herr',
      wo_moechten_sie_die_photovoltaik_installieren: 'Einfamilienhaus',
      wie_alt_ist_ihr_dach: 'Unter 30 Jahre',
      wie_gross_ist_ihre_nutzbare_dachflaeche: 120,
      welche_dachform_hat_ihr_haus: 'Satteldach',
      womit_ist_ihr_dach_gedeckt_dachdeckungstyp: 'Unbefestigte Dachziegel / Dachpfannen',
      handelt_es_sich_bei_dem_interessenten_um_den_eigen: 'Ja',
      wann_soll_die_photovoltaik_installiert_werden: 'So schnell wie möglich',
      welche_finanzierung_kommt_fuer_sie_in_frage: 'Kaufen',
      wie_ist_ihr_dach_ausgerichtet: 'Süd',
      stromverbrauch_in_kwh_jahr: 4500,
      stromspeicher_gewuenscht: 'Ja'
    },
    consent: {
      recording: true,
      recorded_at: new Date().toISOString(),
      source: 'Telefonat',
      contact: true,
      contact_at: new Date().toISOString()
    },
    agent: {
      name: 'Eren Bal (Calendra Admin)',
      id: 'AGT-001'
    },
    recording_url: 'https://calendra-group.online/recordings/test-calendra-pv.mp3'
  };

  // 2. WÄRMEPUMPE (WP)
  const wpPayload = {
    external_id: `CAL-WP-${ts}`,
    product: 'wp',
    customer: {
      first_name: 'Stefan',
      last_name: 'Schmidt',
      street: 'Thermenweg 8',
      zip: '50667',
      city: 'Köln',
      phone: '+491729876543',
      email: 's.schmidt@calendra.de',
      note: 'Alte Gasheizung soll ersetzt werden'
    },
    answers: {
      anrede: 'Herr',
      womit_moechten_sie_in_zukunft_heizen: 'Wärmepumpe',
      womit_heizen_sie_aktuell: 'Erdgas',
      wie_gross_ist_die_zu_beheizende_flaeche: 160,
      welches_baujahr_hat_das_gebaeude: 1995,
      um_welchen_gebaeudetyp_handelt_es_sich: 'Einfamilienhaus',
      wann_waeren_sie_bereit_die_neue_heizung_einbauen_z: '1 bis 3 Monate',
      handelt_es_sich_bei_dem_interessenten_um_den_eigen: 'Ja'
    },
    consent: {
      recording: true,
      recorded_at: new Date().toISOString(),
      source: 'Telefonat',
      contact: true,
      contact_at: new Date().toISOString()
    },
    agent: {
      name: 'Eren Bal (Calendra Admin)',
      id: 'AGT-001'
    },
    recording_url: 'https://calendra-group.online/recordings/test-calendra-wp.mp3'
  };

  // 3. TREPPENLIFT (TB)
  const tbPayload = {
    external_id: `CAL-TB-${ts}`,
    product: 'tb',
    customer: {
      first_name: 'Hannelore',
      last_name: 'Müller',
      street: 'Bergstraße 15',
      zip: '70173',
      city: 'Stuttgart',
      phone: '+491735551234',
      email: 'h.mueller@calendra.de',
      note: 'Treppe über 1 Etage, kurvig'
    },
    answers: {
      anrede: 'Frau',
      was_fuer_einen_lift_suchen_sie: 'Sitzlift (Beliebteste Lösung, Transport über Schienensystem an der Treppe)',
      um_welchen_gebaeudetyp_handelt_es_sich: 'Einfamilienhaus',
      welches_nutzergewicht_soll_der_lift_befoerdern: 'Unter 120 kg',
      wann_wird_der_lift_benoetigt: 'Sofort',
      sind_sie_eigentuemer_entscheider: 'Ja'
    },
    consent: {
      recording: true,
      recorded_at: new Date().toISOString(),
      source: 'Telefonat',
      contact: true,
      contact_at: new Date().toISOString()
    },
    agent: {
      name: 'Eren Bal (Calendra Admin)',
      id: 'AGT-001'
    },
    recording_url: 'https://calendra-group.online/recordings/test-calendra-tb.mp3'
  };

  // 4. BADSANIERUNG (BAD)
  const badPayload = {
    external_id: `CAL-BAD-${ts}`,
    product: 'bad',
    customer: {
      first_name: 'Klaus',
      last_name: 'Wagner',
      street: 'Fliesenstraße 4',
      zip: '20095',
      city: 'Hamburg',
      phone: '+491741112233',
      email: 'k.wagner@calendra.de',
      note: 'Wanne raus, Dusche rein'
    },
    answers: {
      welches_badprojekt_moechten_sie_angehen: 'Teilsanierung (Austausch Badewanne/Dusche)',
      wie_gross_ist_das_badezimmer: '5-6 m²',
      soll_das_bad_barrierefrei_sein: 'Ja (z.B. Bodengleiche Dusche, Sanitärobjekte sanieren & Höhen anpassen (WC, Waschbecken, Haltegriffe))',
      welche_ausstattung_wuenschen_sie: 'Standard',
      was_darf_der_badumbau_kosten: 'Bitte planen Sie bei einem Austausch der Dusche mit 4.000 € bis 6.000 €',
      wann_wird_der_badumbau_benoetigt: 'In 1-6 Monaten',
      sind_sie_eigentuemer_entscheider: 'Ja'
    },
    consent: {
      recording: true,
      recorded_at: new Date().toISOString(),
      source: 'Telefonat',
      contact: true,
      contact_at: new Date().toISOString()
    },
    agent: {
      name: 'Eren Bal (Calendra Admin)',
      id: 'AGT-001'
    },
    recording_url: 'https://calendra-group.online/recordings/test-calendra-bad.mp3'
  };

  // 5. ELEKTROMOBIL (EM)
  const emPayload = {
    external_id: `CAL-EM-${ts}`,
    product: 'em',
    customer: {
      first_name: 'Helga',
      last_name: 'Fischer',
      street: 'Parkweg 9',
      zip: '01067',
      city: 'Dresden',
      phone: '+491759998877',
      email: 'h.fischer@calendra.de',
      note: 'Mobil für Einkäufe im Außenbereich'
    },
    answers: {
      fuer_welches_modell_interessieren_sie_sich: 'Elektromobil (Selber auf-/absteigen & Steuerung per Lenkstange; Bei Einschränkungen für Einkäufe, Spazierfahrten, etc.)',
      wo_soll_die_ueberwiegende_nutzung_stattfinden: 'Außen',
      fuer_welches_gewicht_muss_das_modell_geeignet_sein: 'Unter 150 kg',
      fuer_wen_ist_das_elektromobil_der_elektrorollstuhl: 'Für mich',
      sind_sie_gesetzlich_krankenversichert: 'Ja',
      wo_liegt_die_budgetgrenze_fuer_das_modell: '3.000 € - 3.999 € [Eigenfinanzierung]',
      wann_wird_das_elektromobil_der_elektrorollstuhl_be: 'In 1-3 Monaten'
    },
    consent: {
      recording: true,
      recorded_at: new Date().toISOString(),
      source: 'Telefonat',
      contact: true,
      contact_at: new Date().toISOString()
    },
    agent: {
      name: 'Eren Bal (Calendra Admin)',
      id: 'AGT-001'
    },
    recording_url: 'https://calendra-group.online/recordings/test-calendra-em.mp3'
  };

  await submitLead(pvPayload);
  await submitLead(wpPayload);
  await submitLead(tbPayload);
  await submitLead(badPayload);
  await submitLead(emPayload);

  console.log('\n✅ All test leads processed!');
}

main().catch(console.error);
