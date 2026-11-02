export type PublicLocale = 'de' | 'tr' | 'en';

export interface PublicTranslations {
  nav: {
    services: string;
    sellLeads: string;
    dialer: string;
    pricing: string;
    process: string;
    career: string;
    faq: string;
    login: string;
    livePanel: string;
    requestConsult: string;
    leadBankTag: string;
  };
  hero: {
    badge: string;
    titleStart: string;
    titleGradient: string;
    description: string;
    ctaPrimary: string;
    ctaSecondary: string;
    trustGdpr: string;
    trustNoContract: string;
    trustQuickSetup: string;
  };
  threeFeatures: {
    badge: string;
    title: string;
    subtitle: string;
    card1: {
      title: string;
      desc: string;
      bullets: string[];
    };
    card2: {
      title: string;
      desc: string;
      bullets: string[];
    };
    card3: {
      title: string;
      desc: string;
      bullets: string[];
    };
  };
  infra: {
    badge: string;
    title: string;
    subtitle: string;
    col1Title: string;
    col1Bullets: string[];
    col2Title: string;
    col2Bullets: string[];
    col3Title: string;
    col3Bullets: string[];
  };
  solutions: {
    badge: string;
    title: string;
    subtitle: string;
    pack1Title: string;
    pack1Desc: string;
    pack1Cta: string;
    pack2Title: string;
    pack2Desc: string;
    pack2Cta: string;
    pack3Title: string;
    pack3Desc: string;
    pack3Cta: string;
  };
  career: {
    badge: string;
    title: string;
    desc: string;
    cta: string;
  };
  contact: {
    badge: string;
    title: string;
    subtitle: string;
    tabCompany: string;
    tabJob: string;
    tabPrivate: string;
    typeLeads: string;
    typeCollab: string;
    typeDialer: string;
    typeJob: string;
    typeOther: string;
    lblFirstName: string;
    lblLastName: string;
    lblCompany: string;
    lblPhone: string;
    lblEmail: string;
    lblPostal: string;
    lblCity: string;
    lblProduct: string;
    lblMessage: string;
    consentText: string;
    btnSubmit: string;
    btnSubmitting: string;
    successDefault: string;
    errorConsent: string;
  };
  footer: {
    desc: string;
    rights: string;
    col1Title: string;
    col2Title: string;
    col3Title: string;
    privacy: string;
    imprint: string;
  };
}

export const publicContent: Record<PublicLocale, PublicTranslations> = {
  de: {
    nav: {
      services: 'Leistungen',
      sellLeads: 'Leads verkaufen',
      dialer: 'Cloud-Dialer',
      pricing: 'Preise',
      process: 'Ablauf',
      career: 'Karriere',
      faq: 'FAQ',
      login: 'Login',
      livePanel: 'Live-Panel',
      requestConsult: 'Beratung anfragen',
      leadBankTag: 'Lead-Bank & Dialer',
    },
    hero: {
      badge: 'Unified Lead-Bank & AI Call-Center Platform',
      titleStart: 'Qualitäts-Leads & intelligenter Cloud-Dialer',
      titleGradient: 'unter einem Dach',
      description:
        'Verkaufen, vermitteln und telefonieren Sie verifizierte B2C-Kontakte in Rekordzeit. Mit objektivem KI-Scoring, automatisiertem Kampagnen-Tempo (1–10) und garantierter DSGVO-Rechtssicherheit.',
      ctaPrimary: 'Kostenlos testen & anfragen',
      ctaSecondary: 'Live-Demo ansehen',
      trustGdpr: '100% DSGVO-konform (DE-Hosting)',
      trustNoContract: 'Keine Mindestvertragslaufzeit',
      trustQuickSetup: 'In 10 Minuten einsatzbereit',
    },
    threeFeatures: {
      badge: 'Drei Säulen für Ihren Erfolg',
      title: 'Eine Plattform. Alle Werkzeuge für maximale Abschlüsse.',
      subtitle:
        'Schluss mit isolierten Silos. Verknüpfen Sie Ihre Lead-Generierung nahtlos mit schlagkräftigen Telefonieteams und intelligenter Konvertierungs-KI.',
      card1: {
        title: '1. Teams & Multi-Tenancy',
        desc: 'Verwalten Sie unbegrenzt viele eigene Call-Center und Sub-Unternehmen mit individueller Rechteverwaltung (RBAC), Echtzeit-Wallboards, Supervisor-Mithören und Zeiterfassung.',
        bullets: [
          'Mandantenbaum (Mutter- & Sub-Firmen)',
          'TV-Wallboard mit Live-Agentenstatus',
          'Supervisor Listen, Whisper & Barge-in',
        ],
      },
      card2: {
        title: '2. Leads & Marktplatz',
        desc: 'Zentraler Lead-Pool mit automatischer E.164-Normalisierung, Deduplizierung, Lead-Scoring und direktem Marktplatz-Verkauf an deutsche Top-Käufer.',
        bullets: [
          'Echtzeit-Validierung (PLZ, HLR, E-Mail)',
          'Automatischer Lead-Börsen-Abgleich',
          'Direkter API-Export (Aroundhome, etc.)',
        ],
      },
      card3: {
        title: '3. Cloud-Dialer & KI',
        desc: 'Browserbasiertes WebRTC-Softphone mit bis zu 10x Predictive-Dialer-Tempo, AMD-Mailboxerkennung unter 1,2 Sekunden und KI-Telefonie-Assistenten.',
        bullets: [
          'WebRTC ohne Software-Installation',
          'Ultraschnelle Mailbox-Erkennung (AMD)',
          'Dynamische Kampagnen-Steuerung (1–10)',
        ],
      },
    },
    infra: {
      badge: 'Rundum-Sorglos Paket',
      title: 'Wir kümmern uns um die gesamte Infrastruktur',
      subtitle:
        'Konzentrieren Sie sich voll auf das Telefonieren und Abschließen — den Rest erledigt unsere automatisierte Plattform.',
      col1Title: '1. Vorkonfigurierte Projekte',
      col1Bullets: [
        'PV, Wärmepumpen, Sanierung & Pflegebox',
        'Dynamische Verzweigungen nach Kundenantworten',
        'Versionierte Fragebögen mit Live-Aktualisierung',
      ],
      col2Title: '2. Dialer & Telefonie-Backbone',
      col2Bullets: [
        'WebRTC Softphone mit integriertem Mikrofon-Check',
        'AMD Mailbox-Erkennung in unter 1,2 Sekunden',
        'Wöchentliche Rufnummern-Rotation gegen Spam-Flags',
      ],
      col3Title: '3. Abrechnung & Compliance',
      col3Bullets: [
        'Transparente Kasa mit fällig & nächster Monat',
        'Revisionssichere SHA-256 Audit-Hash-Chain',
        'Automatisierte Reklamations- & Gutschriftläufe',
      ],
    },
    solutions: {
      badge: 'Flexible Module',
      title: 'Wählen Sie die passende Lösung für Ihr Modell',
      subtitle:
        'Nutzen Sie genau die Komponenten, die Sie heute brauchen — nahtlos erweiterbar bei Wachstum.',
      pack1Title: '1. Nur Lead-Bank & CRM',
      pack1Desc:
        'Für reine Vermarkter & Einkäufer: Leads empfangen, KI-Scoring ausführen, an deutsche Abnehmer matchen und auszahlen.',
      pack1Cta: 'Mehr erfahren →',
      pack2Title: '2. Nur Cloud-Dialer',
      pack2Desc:
        'Für bestehende Call-Center: Eigene Daten hochladen, Tempo 1–10 steuern, mit 0,04 €/Min telefonieren und Wallboards nutzen.',
      pack2Cta: 'Mehr erfahren →',
      pack3Title: '3. All-in-One Enterprise',
      pack3Desc:
        'Das komplette Ökosystem: Leads beschaffen, KI-gestützt veredeln, im Dialer abschließen und an Top-Käufer weiterleiten.',
      pack3Cta: 'Jetzt unverbindlich anfragen →',
    },
    career: {
      badge: 'Karriere & Partner-Callcenter',
      title: 'Wir suchen deutschsprachige Vertriebs-Talente & Agenturen',
      desc: 'Ob erfahrener Outbound-Telefonist, Teamleiter im Home-Office oder eigenständiges Call-Center in der Türkei oder Deutschland — profitieren Sie von warmen, KI-vorqualifizierten Leads und attraktiven Stunden- und Provisionsmodellen.',
      cta: 'Jetzt als Mitarbeiter oder Partner bewerben',
    },
    contact: {
      badge: 'Kontakt & Anfrage',
      title: 'Lassen Sie uns gemeinsam durchstarten',
      subtitle: 'Füllen Sie das Formular aus. Unser Team meldet sich innerhalb von 30 Minuten bei Ihnen.',
      tabCompany: 'Unternehmen / Call-Center',
      tabJob: 'Bewerber / Jobsuchende',
      tabPrivate: 'Privatperson / Sonstige',
      typeLeads: 'Leads kaufen / verkaufen',
      typeCollab: 'Partner-Callcenter Kooperation',
      typeDialer: 'Cloud-Dialer Softwarezugang',
      typeJob: 'Bewerbung als Telefonist / Agent',
      typeOther: 'Sonstige Anfrage',
      lblFirstName: 'Vorname',
      lblLastName: 'Nachname',
      lblCompany: 'Firmenname',
      lblPhone: 'Telefonnummer',
      lblEmail: 'E-Mail-Adresse',
      lblPostal: 'Postleitzahl',
      lblCity: 'Stadt',
      lblProduct: 'Hauptbranche / Produkt',
      lblMessage: 'Ihre Nachricht / Notiz (optional)',
      consentText: 'Ich stimme der Kontaktaufnahme per E-Mail oder Telefon sowie der Verarbeitung meiner Angaben gemäß Datenschutzerklärung zu.',
      btnSubmit: 'Anfrage jetzt absenden',
      btnSubmitting: 'Wird übermittelt...',
      successDefault: 'Vielen Dank! Ihre Anfrage wurde erfolgreich übermittelt. Wir melden uns in Kürze.',
      errorConsent: 'Bitte stimmen Sie der Verarbeitung Ihrer Daten gemäß DSGVO zu.',
    },
    footer: {
      desc: 'Linkora ist die führende Plattform für B2C-Leadvermittlung, KI-basiertes Lead-Scoring und Hochleistungs-Cloud-Telefonie im deutschsprachigen Raum.',
      rights: 'Alle Rechte vorbehalten.',
      col1Title: 'Lösungen',
      col2Title: 'Unternehmen',
      col3Title: 'Rechtliches',
      privacy: 'Datenschutz',
      imprint: 'Impressum',
    },
  },
  tr: {
    nav: {
      services: 'Hizmetler',
      sellLeads: 'Lead Satışı',
      dialer: 'Bulut Dialer',
      pricing: 'Fiyatlandırma',
      process: 'Nasıl Çalışır?',
      career: 'Kariyer',
      faq: 'SSS',
      login: 'Giriş Yap',
      livePanel: 'Canlı Panel',
      requestConsult: 'Teklif & Bilgi Al',
      leadBankTag: 'Lead Havuzu & Dialer',
    },
    hero: {
      badge: 'Entegre Lead Havuzu & Yapay Zekalı Çağrı Merkezi Platformu',
      titleStart: 'Kaliteli Leadler & Akıllı Bulut Dialer',
      titleGradient: 'tek çatı altında',
      description:
        'Doğrulanmış B2C kontaklarını rekor sürede satın, yönlendirin ve arayın. Objektif yapay zeka puanlaması, otomatik kampanya temposu (1–10) ve tam KVKK / GDPR güvencesiyle.',
      ctaPrimary: 'Ücretsiz Test Et & Bilgi Al',
      ctaSecondary: 'Canlı Demoyu İncele',
      trustGdpr: '%100 KVKK & GDPR Uyumlu (Almanya Sunucuları)',
      trustNoContract: 'Taahhüt veya Minimum Sözleşme Yok',
      trustQuickSetup: '10 Dakikada Kullanıma Hazır',
    },
    threeFeatures: {
      badge: 'Başarınız İçin Üç Temel Sütun',
      title: 'Tek Platform. Maksimum Satış İçin Tüm Araçlar.',
      subtitle:
        'Ayrı ayrı programlarla uğraşmaya son. Lead üretiminizi, güçlü çağrı ekiplerinizi ve akıllı yapay zeka dönüşüm araçlarınızı tek merkezden yönetin.',
      card1: {
        title: '1. Takımlar & Çoklu Şirket Yönetimi',
        desc: 'Sınırsız sayıda çağrı merkezi ve alt şirket oluşturun. Gelişmiş yetkilendirme (RBAC), canlı TV ekranları, yönetici dinleme (Supervisor) ve vardiya takibi.',
        bullets: [
          'Şirket ve alt bayi hiyerarşik ağacı',
          'Canlı personel durumlu TV Wallboard',
          'Yönetici Dinleme, Fısıldama ve Hatta Girme',
        ],
      },
      card2: {
        title: '2. Leadler & Pazar Yeri',
        desc: 'Otomatik E.164 numara doğrulama, mükerrer kontrolü, yapay zeka skorlaması ve Almanya pazarındaki büyük alıcılara anlık API ile satış.',
        bullets: [
          'Anlık Doğrulama (Posta Kodu, HLR, E-Posta)',
          'Otomatik Pazar Yeri Fiyatlandırması',
          'Doğrudan API Entegrasyonu (Aroundhome vb.)',
        ],
      },
      card3: {
        title: '3. Bulut Dialer & Yapay Zeka',
        desc: 'Kurulum gerektirmeyen WebRTC tarayıcı telefonu. 10 kata kadar Predictive Dialer hızı, 1.2 saniyede telesekreter tespiti (AMD) ve akıllı asistan.',
        bullets: [
          'Program kurmadan doğrudan tarayıcıdan arama',
          'Ultra hızlı telesekreter ayıklama (AMD)',
          'Dinamik kampanya hız kontrolü (1–10 arası)',
        ],
      },
    },
    infra: {
      badge: 'Eksiksiz Altyapı Paketi',
      title: 'Tüm Teknik Altyapıyı Biz Yönetiyoruz',
      subtitle:
        'Siz sadece arama yapmaya ve satış kapatmaya odaklanın — geriye kalan tüm veri akışını ve teknik sistemi Linkora otomatikleştirir.',
      col1Title: '1. Hazır Yapılandırılmış Projeler',
      col1Bullets: [
        'Güneş Enerjisi (PV), Isı Pompası, Tadilat & Bakım Kutusu',
        'Müşteri yanıtlarına göre dinamik soru dallanması',
        'Canlı güncellenen versiyonlu soru anketleri',
      ],
      col2Title: '2. Dialer & Santral Altyapısı',
      col2Bullets: [
        'Entegre mikrofon testli WebRTC Softphone',
        '1.2 saniye altında telesekreter tespiti (AMD)',
        'Spam engeline karşı haftalık numara rotasyonu',
      ],
      col3Title: '3. Muhasebe & Hukuki Uyumluluk',
      col3Bullets: [
        'Şeffaf kasa, vadesi gelen ve gelecek ay hakedişleri',
        'Değiştirilemez SHA-256 denetim zinciri',
        'Otomatik iade ve alacak mahsuplaşma akışı',
      ],
    },
    solutions: {
      badge: 'Esnek Modüller',
      title: 'İş Modelinize Uygun Paketi Seçin',
      subtitle:
        'Yalnızca bugün ihtiyacınız olan bileşenleri kullanın — büyüdükçe dilediğiniz modülü anında devreye alın.',
      pack1Title: '1. Yalnızca Lead Havuzu & CRM',
      pack1Desc:
        'Pazarlamacılar ve ajanslar için: Leadleri sisteme aktarın, yapay zeka ile puanlayın, Alman kurumsal alıcılara satın ve hakedişinizi alın.',
      pack1Cta: 'Detaylı Bilgi →',
      pack2Title: '2. Yalnızca Bulut Dialer',
      pack2Desc:
        'Mevcut Çağrı Merkezleri için: Kendi datanızı yükleyin, 1-10 arası hız ayarlayın, dakikası 0,04 € ile arayın ve canlı panelleri kullanın.',
      pack2Cta: 'Detaylı Bilgi →',
      pack3Title: '3. All-in-One Kurumsal Çözüm',
      pack3Desc:
        'Eksiksiz ekosistem: Leadleri toplayın, yapay zekayla işleyin, dialer ile satışa dönüştürün ve zirvedeki iş ortaklarına faturalandırın.',
      pack3Cta: 'Hemen Başvurun →',
    },
    career: {
      badge: 'Kariyer & İş Ortaklığı',
      title: 'Almanca Bilen Satış Temsilcileri & Çağrı Merkezleri Arıyoruz',
      desc: 'İster evden çalışan deneyimli bir Almanca telefonist veya takım lideri olun, ister Türkiye ya da Almanya merkezli bağımsız bir çağrı merkezi — hazır, filtrelenmiş sıcak leadler ve yüksek prim olanaklarıyla ekibimize katılın.',
      cta: 'Personel veya İş Ortağı Olarak Başvur',
    },
    contact: {
      badge: 'İletişim & Başvuru',
      title: 'Birlikte Büyümeye Başlayalım',
      subtitle: 'Formu doldurun. Uzman ekibimiz 30 dakika içerisinde sizinle iletişime geçsin.',
      tabCompany: 'Şirket / Çağrı Merkezi',
      tabJob: 'İş Arayan / Temsilci',
      tabPrivate: 'Bireysel / Diğer',
      typeLeads: 'Lead Alımı / Satışı',
      typeCollab: 'Partner Çağrı Merkezi İş Birliği',
      typeDialer: 'Bulut Dialer Yazılımı',
      typeJob: 'Almanca Müşteri Temsilciliği Başvurusu',
      typeOther: 'Diğer Konular',
      lblFirstName: 'Adınız',
      lblLastName: 'Soyadınız',
      lblCompany: 'Şirket Adı',
      lblPhone: 'Telefon Numaranız',
      lblEmail: 'E-Posta Adresiniz',
      lblPostal: 'Posta Kodu',
      lblCity: 'Şehir',
      lblProduct: 'Ana Sektör / Proje',
      lblMessage: 'Mesajınız / Notunuz (isteğe bağlı)',
      consentText: 'Bilgilerimin KVKK ve Gizlilik Politikası kapsamında işlenmesini, telefon veya e-posta yoluyla benimle iletişime geçilmesini onaylıyorum.',
      btnSubmit: 'Başvuruyu Gönder',
      btnSubmitting: 'İletiliyor...',
      successDefault: 'Teşekkürler! Başvurunuz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.',
      errorConsent: 'Lütfen veri işleme ve iletişim onay kutucuğunu işaretleyin.',
    },
    footer: {
      desc: 'Linkora, Almanca konuşulan pazarda B2C lead yönetimi, yapay zeka puanlaması ve yüksek performanslı bulut santral altyapısında lider platformdur.',
      rights: 'Tüm hakları saklıdır.',
      col1Title: 'Çözümler',
      col2Title: 'Şirket',
      col3Title: 'Yasal',
      privacy: 'Gizlilik ve KVKK',
      imprint: 'Künye (Impressum)',
    },
  },
  en: {
    nav: {
      services: 'Services',
      sellLeads: 'Sell Leads',
      dialer: 'Cloud Dialer',
      pricing: 'Pricing',
      process: 'Workflow',
      career: 'Careers',
      faq: 'FAQ',
      login: 'Sign In',
      livePanel: 'Live Demo',
      requestConsult: 'Get in Touch',
      leadBankTag: 'Lead Bank & Dialer',
    },
    hero: {
      badge: 'Unified Lead-Bank & AI Call-Center Platform',
      titleStart: 'Quality Leads & Smart Cloud Dialer',
      titleGradient: 'Under One Roof',
      description:
        'Sell, qualify and call verified B2C contacts in record time. Powered by objective AI scoring, automated dialing tempo (1–10) and full GDPR compliance.',
      ctaPrimary: 'Try Free & Request Demo',
      ctaSecondary: 'View Live Demo',
      trustGdpr: '100% GDPR Compliant (Germany Hosting)',
      trustNoContract: 'No Long-Term Contract Lock-in',
      trustQuickSetup: 'Ready to Run in 10 Minutes',
    },
    threeFeatures: {
      badge: 'Three Pillars of Growth',
      title: 'One Platform. All Tools for Maximum Conversions.',
      subtitle:
        'Stop using disconnected software silos. Seamlessly connect your lead generation, high-velocity telephony agents and AI conversion tools in one place.',
      card1: {
        title: '1. Teams & Multi-Tenancy',
        desc: 'Manage unlimited internal and partner call centers with role-based access control, real-time wallboards, supervisor listen/whisper/barge-in and time-tracking.',
        bullets: [
          'Hierarchical parent & sub-tenant company trees',
          'Live agent status TV wallboard',
          'Supervisor Listen, Whisper & Barge-in',
        ],
      },
      card2: {
        title: '2. Leads & Marketplace',
        desc: 'Centralized lead banking with E.164 normalization, deduplication, AI scoring and automated dispatch to top German buyers.',
        bullets: [
          'Real-time verification (Postal, HLR, Email)',
          'Automated marketplace routing',
          'Direct API integrations (Aroundhome, etc.)',
        ],
      },
      card3: {
        title: '3. Cloud Dialer & AI',
        desc: 'Browser-based WebRTC softphone with up to 10x predictive pacing, sub-1.2s answering machine detection (AMD) and real-time AI assistance.',
        bullets: [
          'WebRTC softphone with zero installation',
          'Sub-1.2s Answering Machine Detection (AMD)',
          'Dynamic campaign pacing control (1–10)',
        ],
      },
    },
    infra: {
      badge: 'All-Inclusive Infrastructure',
      title: 'We Handle the Entire Telephony & Data Stack',
      subtitle:
        'Focus completely on qualifying and closing deals — our automated platform takes care of all compliance, routing and server operations.',
      col1Title: '1. Pre-Configured Campaigns',
      col1Bullets: [
        'Solar (PV), Heat Pumps, Home Renovation & Healthcare',
        'Dynamic branching based on customer answers',
        'Version-controlled live questionnaires',
      ],
      col2Title: '2. Telephony Backbone',
      col2Bullets: [
        'WebRTC softphone with audio device check',
        'AMD detection in under 1.2 seconds',
        'Weekly CLI caller-ID rotation against spam flags',
      ],
      col3Title: '3. Billing & Compliance',
      col3Bullets: [
        'Transparent balances, due payouts and projections',
        'Cryptographic SHA-256 audit hash logs',
        'Automated rejection & credit handling',
      ],
    },
    solutions: {
      badge: 'Modular Architecture',
      title: 'Choose the Right Setup for Your Business',
      subtitle:
        'Use only what you need today — easily unlock additional modules as your team grows.',
      pack1Title: '1. Lead Banking & CRM Only',
      pack1Desc:
        'For brokers & lead publishers: Ingest leads, run AI qualification, match against top German buyers and collect commissions.',
      pack1Cta: 'Learn more →',
      pack2Title: '2. Cloud Dialer Only',
      pack2Desc:
        'For existing call centers: Upload your contacts, dial at speeds 1–10, enjoy €0.04/min rates and real-time supervisor wallboards.',
      pack2Cta: 'Learn more →',
      pack3Title: '3. All-in-One Enterprise',
      pack3Desc:
        'The complete ecosystem: Sourcing, AI enrichment, high-speed automated calling and automated buyer API delivery.',
      pack3Cta: 'Contact Sales →',
    },
    career: {
      badge: 'Careers & Partner Agencies',
      title: 'We Are Hiring German-Speaking Sales Talents & Call Centers',
      desc: 'Whether you are an experienced remote sales agent, team leader or independent contact center in Turkey or Germany — capitalize on warm, AI-screened leads with industry-leading commission models.',
      cta: 'Apply as Agent or Partner Agency',
    },
    contact: {
      badge: 'Contact & Inquiries',
      title: "Let's Accelerate Your Sales Operations",
      subtitle: 'Complete the form below. Our team will contact you within 30 minutes.',
      tabCompany: 'Company / Call Center',
      tabJob: 'Job Applicant / Agent',
      tabPrivate: 'Individual / Other',
      typeLeads: 'Buy / Sell Leads',
      typeCollab: 'Partner Call Center Collaboration',
      typeDialer: 'Cloud Dialer Access',
      typeJob: 'German Telephony Agent Application',
      typeOther: 'General Inquiry',
      lblFirstName: 'First Name',
      lblLastName: 'Last Name',
      lblCompany: 'Company Name',
      lblPhone: 'Phone Number',
      lblEmail: 'Email Address',
      lblPostal: 'Postal Code',
      lblCity: 'City',
      lblProduct: 'Core Industry / Product',
      lblMessage: 'Your Message (optional)',
      consentText: 'I consent to being contacted via email or phone and agree to data processing according to the Privacy Policy.',
      btnSubmit: 'Submit Inquiry Now',
      btnSubmitting: 'Submitting...',
      successDefault: 'Thank you! Your request has been received. Our team will reach out shortly.',
      errorConsent: 'Please accept the privacy terms to submit your inquiry.',
    },
    footer: {
      desc: 'Linkora is the leading B2C lead marketplace, AI scoring platform and high-performance cloud telephony solution in the DACH region.',
      rights: 'All rights reserved.',
      col1Title: 'Solutions',
      col2Title: 'Company',
      col3Title: 'Legal',
      privacy: 'Privacy Policy',
      imprint: 'Imprint',
    },
  },
};
