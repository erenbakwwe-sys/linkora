import { getDictionary, interpolate, defaultLocale } from '../src/index.js';

describe('i18n Package Tests (DE, TR, EN)', () => {
  it('should default to German (DE)', () => {
    expect(defaultLocale).toBe('de');
    const dict = getDictionary('de');
    expect(dict.common.welcome).toBe('Willkommen, {user}');
    expect(dict.common.switch_mode).toBe('Modus wechseln');
  });

  it('should have exact German strings matching the reference screenshots', () => {
    const de = getDictionary('de');
    // Sidebar Groups
    expect(de.menu.groups.ARBEIT).toBe('ARBEIT');
    expect(de.menu.groups.LEADS_KUNDEN).toBe('LEADS & KUNDEN');
    expect(de.menu.groups.PROJEKTE_FRAGEN).toBe('PROJEKTE & FRAGEN');
    expect(de.menu.groups.CALL_CENTER_DIALER).toBe('CALL-CENTER / DIALER');
    expect(de.menu.groups.FINANZEN).toBe('FINANZEN');
    expect(de.menu.groups.BERICHTE).toBe('BERICHTE');
    expect(de.menu.groups.BENUTZER).toBe('BENUTZER');
    expect(de.menu.groups.ALLGEMEIN).toBe('ALLGEMEIN');
    expect(de.menu.groups.LEAD_MARKTPLATZ).toBe('LEAD-MARKTPLATZ');

    // Sidebar Items
    expect(de.menu.items.call_screen).toBe('Anruf-Bildschirm');
    expect(de.menu.items.callbacks).toBe('Rückrufe');
    expect(de.menu.items.rota).toBe('Rota-Tafel');
    expect(de.menu.items.excel).toBe('Excel');
    expect(de.menu.items.wallboard).toBe('Team-Wallboard');
    expect(de.menu.items.hr_time).toBe('HR-Zeit');
    expect(de.menu.items.lead_customers).toBe('Lead-Kunden');
    expect(de.menu.items.project_management).toBe('Projekt-Verwaltung');
    expect(de.menu.items.database).toBe('Datenbank');
    expect(de.menu.items.campaigns).toBe('Kampagnen');
    expect(de.menu.items.auto_dial_settings).toBe('Auto-Anruf-Einstellungen');
    expect(de.menu.items.call_recordings).toBe('Anrufaufzeichnungen');
    expect(de.menu.items.cash_income).toBe('Kasa / Einnahmen');
    expect(de.menu.items.balance_costs).toBe('Guthaben / Kosten');
    expect(de.menu.items.user_stats).toBe('Benutzerstatistiken');
    expect(de.menu.items.analytics_conversion).toBe('Analytik & Konversion');
    expect(de.menu.items.talk_time_report).toBe('Gesprächszeit-Bericht');

    // Dashboard KPI
    expect(de.dashboard.kpi.leads_this_month).toBe('Leads diesen Monat');
    expect(de.dashboard.kpi.in_qc).toBe('In QC-Prüfung');
    expect(de.dashboard.kpi.confirmed_month).toBe('Bestätigt (Monat)');
    expect(de.dashboard.kpi.storno_month).toBe('Storno (Monat)');
    expect(de.dashboard.kpi.open_due).toBe('Offen (fällig)');
    expect(de.dashboard.kpi.next_month).toBe('Nächster Monat');

    // Active Employees & Legend
    expect(de.dashboard.active_agents.title).toBe('Aktive Mitarbeiter');
    expect(de.dashboard.active_agents.status_legend.on_call).toBe('Am Telefon');
    expect(de.dashboard.active_agents.status_legend.wrap_up).toBe('Nachbearbeitung');
    expect(de.dashboard.active_agents.status_legend.waiting).toBe('Wartend');
    expect(de.dashboard.active_agents.durations.light).toBe('hell: 0–5 Min');
    expect(de.dashboard.active_agents.durations.medium).toBe('mittel: 5–10 Min');
    expect(de.dashboard.active_agents.durations.dark).toBe('dunkel: 10+ Min');

    // Warning Banner
    expect(de.common.low_balance_warning).toBe('Guthaben niedrig: {amount} € — vor Anrufabbruch aufladen.');
    expect(de.common.top_up).toBe('Aufladen →');
  });

  it('should interpolate parameters correctly', () => {
    const template = 'Guthaben niedrig: {amount} € — vor Anrufabbruch aufladen.';
    const result = interpolate(template, { amount: '10.00' });
    expect(result).toBe('Guthaben niedrig: 10.00 € — vor Anrufabbruch aufladen.');
  });

  it('should support Turkish (TR)', () => {
    const tr = getDictionary('tr');
    expect(tr.common.welcome).toBe('Hoş geldiniz, {user}');
    expect(tr.common.switch_mode).toBe('Mod Değiştir');
    expect(tr.dashboard.active_agents.title).toBe('Aktif Personel');
  });

  it('should support English (EN)', () => {
    const en = getDictionary('en');
    expect(en.common.welcome).toBe('Welcome, {user}');
    expect(en.common.switch_mode).toBe('Switch Mode');
    expect(en.dashboard.active_agents.title).toBe('Active Agents');
  });
});
