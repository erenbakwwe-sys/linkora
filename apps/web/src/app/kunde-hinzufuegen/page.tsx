'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/shell/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import {
  ArrowLeft,
  Calendar,
  UserPlus,
  Phone,
  PhoneCall,
  PhoneOff,
  Volume2,
  Settings,
  X,
  Play,
  Pause,
  ChevronDown,
  MessageSquare,
  Send,
  Sparkles,
  CheckCircle2,
  Upload,
  FileAudio,
  Radio,
  Clock,
  HelpCircle,
  Bell,
  Sun,
  ShieldAlert,
  Bath,
  Accessibility,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isSystem?: boolean;
}

export default function KundeHinzufuegenPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { locale } = useI18n();

  const agentName = user?.firstName || user?.username || 'Murat2';
  const assignedCallerId = user?.callerIdNumber || '+494042925873';

  // Project Selection State
  const [selectedProject, setSelectedProject] = useState<string>('');

  // Common Customer Fields
  const [anrede, setAnrede] = useState('');
  const [vorname, setVorname] = useState('');
  const [nachname, setNachname] = useState('');
  const [adresse, setAdresse] = useState('');
  const [plz, setPlz] = useState('');
  const [ort, setOrt] = useState('');
  const [telefonnummer, setTelefonnummer] = useState('');
  const [email, setEmail] = useState('');
  const [audioFileName, setAudioFileName] = useState<string | null>(null);
  const [notiz, setNotiz] = useState('');

  // PV Questions State
  const [pvInstallLocation, setPvInstallLocation] = useState('');
  const [pvRoofAge, setPvRoofAge] = useState('');
  const [pvRoofArea, setPvRoofArea] = useState('');
  const [pvRoofShape, setPvRoofShape] = useState('');
  const [pvRoofCover, setPvRoofCover] = useState('');
  const [pvIsOwner, setPvIsOwner] = useState('');
  const [pvInstallTime, setPvInstallTime] = useState('');
  const [pvFinancing, setPvFinancing] = useState('');
  const [pvRoofOrientation, setPvRoofOrientation] = useState('');
  const [pvPowerConsumption, setPvPowerConsumption] = useState('');
  const [pvBatteryStorage, setPvBatteryStorage] = useState('');
  const [pvAvailability, setPvAvailability] = useState('');

  // Treppenlift Questions State
  const [tlLiftType, setTlLiftType] = useState('');
  const [tlBuildingType, setTlBuildingType] = useState('');
  const [tlUserWeight, setTlUserWeight] = useState('');
  const [tlTimeFrame, setTlTimeFrame] = useState('');
  const [tlIsOwner, setTlIsOwner] = useState('');
  const [tlFloors, setTlFloors] = useState('');
  const [tlCareLevel, setTlCareLevel] = useState('');
  const [tlStairCourse, setTlStairCourse] = useState('');
  const [tlMobility, setTlMobility] = useState('');
  const [tlStairWidth, setTlStairWidth] = useState('');
  const [tlStepCount, setTlStepCount] = useState('');
  const [tlHeightDiff, setTlHeightDiff] = useState('');
  const [tlOutdoor, setTlOutdoor] = useState('');
  const [tlAvailability, setTlAvailability] = useState('');

  // WP States
  const [wpCurrentSystem, setWpCurrentSystem] = useState('');
  const [wpHeatingAge, setWpHeatingAge] = useState('');
  const [wpLivingSpace, setWpLivingSpace] = useState('');
  const [wpInstallTime, setWpInstallTime] = useState('');

  // Badsanierung Questions State
  const [badProjectType, setBadProjectType] = useState('');
  const [badSize, setBadSize] = useState('');
  const [badBarrierFree, setBadBarrierFree] = useState('');
  const [badFeatures, setBadFeatures] = useState('');
  const [badBudget, setBadBudget] = useState('');
  const [badTimeFrame, setBadTimeFrame] = useState('');
  const [badIsOwner, setBadIsOwner] = useState('');

  // Elektromobil / Elektrorollstuhl Questions State
  const [emModelType, setEmModelType] = useState('');
  const [emUsageArea, setEmUsageArea] = useState('');
  const [emUserWeight, setEmUserWeight] = useState('');
  const [emTargetPerson, setEmTargetPerson] = useState('');
  const [emHealthInsurance, setEmHealthInsurance] = useState('');
  const [emBudgetLimit, setEmBudgetLimit] = useState('');
  const [emWheelchairSpeed, setEmWheelchairSpeed] = useState('');
  const [emWheelchairRange, setEmWheelchairRange] = useState('');
  const [emScooterSpeed, setEmScooterSpeed] = useState('');
  const [emScooterRange, setEmScooterRange] = useState('');
  const [emTimeFrame, setEmTimeFrame] = useState('');

  // Additional Projects Checkboxes (je Projekt ein eigener Lead)
  const [alsoWp, setAlsoWp] = useState(false);
  const [alsoTreppenlift, setAlsoTreppenlift] = useState(false);
  const [alsoPv, setAlsoPv] = useState(false);
  const [alsoBadsanierung, setAlsoBadsanierung] = useState(false);
  const [alsoElektromobil, setAlsoElektromobil] = useState(false);

  // Wiedervorlage
  const [wiedervorlageDate, setWiedervorlageDate] = useState('');

  // Form submitting
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Right Sidecar (Manueller Anruf & Softphone)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [isDialing, setIsDialing] = useState(false);
  const [isOnCall, setIsOnCall] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [audioStatus, setAudioStatus] = useState('Bağlanıyor...');

  // Chat State
  const [chatTab, setChatTab] = useState<'TEAM' | 'FIRMA'>('TEAM');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'Murat Dere', text: 'Bugün randevular çok iyi gidiyor!', time: '14:22' },
    { id: '2', sender: 'System', text: 'Floor 1 aktif arama modunda.', time: '14:30', isSystem: true },
    { id: '3', sender: 'Umut', text: 'Yeni PV listesi yüklendi mi?', time: '14:45' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // PLZ Auto-complete
  const handlePlzChange = (val: string) => {
    setPlz(val);
    const trimmed = val.trim();
    if (trimmed.startsWith('10') || trimmed.startsWith('12') || trimmed.startsWith('13')) {
      if (!ort) setOrt('Berlin');
    } else if (trimmed.startsWith('80') || trimmed.startsWith('81')) {
      if (!ort) setOrt('München');
    } else if (trimmed.startsWith('20') || trimmed.startsWith('22')) {
      if (!ort) setOrt('Hamburg');
    } else if (trimmed.startsWith('50') || trimmed.startsWith('51')) {
      if (!ort) setOrt('Köln');
    } else if (trimmed.startsWith('60') || trimmed.startsWith('65')) {
      if (!ort) setOrt('Frankfurt am Main');
    } else if (trimmed.startsWith('70') || trimmed.startsWith('71')) {
      if (!ort) setOrt('Stuttgart');
    }
  };

  // Audio tone test
  const playTestTone = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
      showToast('🔊 Audio-Testton erfolgreich abgespielt.');
    } catch {
      showToast('Audio-Ausgabe bereit.');
    }
  };

  // Repair WebRTC
  const handleRepairAudio = () => {
    setAudioStatus('Bağlanıyor...');
    setTimeout(() => {
      setAudioStatus('Hazır / Bereit');
      showToast('✅ WebRTC-Verbindung neu kalibriert.');
    }, 600);
  };

  // Call simulation
  const handleManualCall = () => {
    if (!phoneNumber.trim()) {
      showToast('Bitte geben Sie zuerst eine Telefonnummer ein.');
      return;
    }
    setIsDialing(true);
    setAudioStatus('Aranıyor...');
    setTimeout(() => {
      setIsDialing(false);
      setIsOnCall(true);
      setAudioStatus('Görüşme Aktif');
    }, 1000);
  };

  const handleHangup = () => {
    setIsOnCall(false);
    setAudioStatus('Bağlantı Sonlandı');
    showToast('Görüşme sonlandırıldı.');
  };

  // Chat send
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: agentName,
      text: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages((prev) => [...prev, msg]);
    setNewMessage('');
  };

  // File upload simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        showToast('Datei ist zu groß (max. 50 MB erlaubt).');
        return;
      }
      setAudioFileName(file.name);
      showToast(`Sprachaufnahme "${file.name}" ausgewählt.`);
    }
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject) {
      showToast('Bitte zuerst oben ein Projekt auswählen.');
      return;
    }

    if (!vorname.trim() || !nachname.trim() || !telefonnummer.trim()) {
      showToast('Bitte die Pflichtfelder (Vorname, Nachname, Telefonnummer) ausfüllen.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Gather project answers
      const answers: Record<string, any> = {};
      if (selectedProject === 'PV') {
        answers['pvInstallLocation'] = pvInstallLocation;
        answers['pvRoofAge'] = pvRoofAge;
        answers['pvRoofArea'] = pvRoofArea;
        answers['pvRoofShape'] = pvRoofShape;
        answers['pvRoofCover'] = pvRoofCover;
        answers['pvIsOwner'] = pvIsOwner;
        answers['pvInstallTime'] = pvInstallTime;
        answers['pvFinancing'] = pvFinancing;
        answers['pvRoofOrientation'] = pvRoofOrientation;
        answers['pvPowerConsumption'] = pvPowerConsumption;
        answers['pvBatteryStorage'] = pvBatteryStorage;
        answers['pvAvailability'] = pvAvailability;
      } else if (selectedProject === 'Treppenlift') {
        answers['tlLiftType'] = tlLiftType;
        answers['tlBuildingType'] = tlBuildingType;
        answers['tlUserWeight'] = tlUserWeight;
        answers['tlTimeFrame'] = tlTimeFrame;
        answers['tlIsOwner'] = tlIsOwner;
        answers['tlFloors'] = tlFloors;
        answers['tlCareLevel'] = tlCareLevel;
        answers['tlStairCourse'] = tlStairCourse;
        answers['tlMobility'] = tlMobility;
        answers['tlStairWidth'] = tlStairWidth;
        answers['tlStepCount'] = tlStepCount;
        answers['tlHeightDiff'] = tlHeightDiff;
        answers['tlOutdoor'] = tlOutdoor;
        answers['tlAvailability'] = tlAvailability;
      } else if (selectedProject === 'WP') {
        answers['wpCurrentSystem'] = wpCurrentSystem;
        answers['wpHeatingAge'] = wpHeatingAge;
        answers['wpLivingSpace'] = wpLivingSpace;
        answers['wpInstallTime'] = wpInstallTime;
      } else if (selectedProject === 'Badsanierung') {
        answers['badProjectType'] = badProjectType;
        answers['badSize'] = badSize;
        answers['badBarrierFree'] = badBarrierFree;
        answers['badFeatures'] = badFeatures;
        answers['badBudget'] = badBudget;
        answers['badTimeFrame'] = badTimeFrame;
        answers['badIsOwner'] = badIsOwner;
      } else if (selectedProject === 'Elektromobil / Elektrorollstuhl' || selectedProject === 'Elektromobil') {
        answers['emModelType'] = emModelType;
        answers['emUsageArea'] = emUsageArea;
        answers['emUserWeight'] = emUserWeight;
        answers['emTargetPerson'] = emTargetPerson;
        answers['emHealthInsurance'] = emHealthInsurance;
        answers['emBudgetLimit'] = emBudgetLimit;
        answers['emWheelchairSpeed'] = emWheelchairSpeed;
        answers['emWheelchairRange'] = emWheelchairRange;
        answers['emScooterSpeed'] = emScooterSpeed;
        answers['emScooterRange'] = emScooterRange;
        answers['emTimeFrame'] = emTimeFrame;
      }

      // Check additional projects
      const additionalProjects: string[] = [];
      if (alsoPv && selectedProject !== 'PV') additionalProjects.push('PV');
      if (alsoWp && selectedProject !== 'WP') additionalProjects.push('WP');
      if (alsoTreppenlift && selectedProject !== 'Treppenlift') additionalProjects.push('Treppenlift');
      if (alsoBadsanierung && selectedProject !== 'Badsanierung') additionalProjects.push('Badsanierung');
      if (alsoElektromobil && selectedProject !== 'Elektromobil / Elektrorollstuhl' && selectedProject !== 'Elektromobil') {
        additionalProjects.push('Elektromobil / Elektrorollstuhl');
      }

      // Format questionnaire answers for display in Admin drawer
      const questionLabels: Record<string, string> = {
        pvInstallLocation: 'Wo möchten Sie die Photovoltaik installieren?',
        pvRoofAge: 'Wie alt ist Ihr Dach?',
        pvRoofArea: 'Wie groß ist Ihre nutzbare Dachfläche?',
        pvRoofShape: 'Welche Dachform hat Ihr Haus?',
        pvRoofCover: 'Womit ist ihr Dach gedeckt? (Dachdeckungstyp)',
        pvIsOwner: 'Handelt es sich bei dem Interessenten um den Eigentümer/Entscheider?',
        pvInstallTime: 'Wann soll die Photovoltaik installiert werden?',
        pvFinancing: 'Welche Finanzierung kommt für Sie in Frage?',
        pvRoofOrientation: 'Wie ist Ihr Dach ausgerichtet?',
        pvPowerConsumption: 'Stromverbrauch in kWh/Jahr',
        pvBatteryStorage: 'Stromspeicher gewünscht?',
        pvAvailability: 'Erreichbarkeit?',
        tlLiftType: 'Was für einen Lift suchen Sie?',
        tlBuildingType: 'Um welchen Gebäudetyp handelt es sich?',
        tlUserWeight: 'Welches Nutzergewicht soll der Lift befördern?',
        tlTimeFrame: 'Wann wird der Lift benötigt?',
        tlIsOwner: 'Sind Sie Eigentümer/Entscheider',
        tlFloors: 'Wie viele Etagen müssen überwunden werden?',
        tlCareLevel: 'Liegt ein Pflegegrad vor?',
        tlStairCourse: 'Wie verläuft die Treppe?',
        tlMobility: 'Mobilität des Nutzers',
        tlStairWidth: 'Treppenbreite (in cm)',
        tlStepCount: 'Anzahl der Stufen',
        tlHeightDiff: 'Höhenunterschied (in cm)',
        tlOutdoor: 'Wird der Lift im Außenbereich benötigt?',
        tlAvailability: 'Treppenlift · Erreichbarkeit',
        wpCurrentSystem: 'Aktuelles Heizsystem?',
        wpHeatingAge: 'Alter der Heizung?',
        wpLivingSpace: 'Wohnfläche (in m²)?',
        wpInstallTime: 'Wann soll die Wärmepumpe installiert werden?',
        badProjectType: 'Welches Badprojekt möchten Sie angehen?',
        badSize: 'Wie groß ist das Badezimmer?',
        badBarrierFree: 'Soll das Bad barrierefrei sein?',
        badFeatures: 'Welche Ausstattung wünschen Sie?',
        badBudget: 'Was darf der Badumbau kosten?',
        badTimeFrame: 'Wann wird der Badumbau benötigt?',
        badIsOwner: 'Sind Sie Eigentümer/Entscheider?',
        emModelType: 'Für welches Modell interessieren Sie sich?',
        emUsageArea: 'Wo soll die überwiegende Nutzung stattfinden?',
        emUserWeight: 'Für welches Gewicht muss das Modell geeignet sein?',
        emTargetPerson: 'Für wen ist das Elektromobil / der Elektrorollstuhl gedacht?',
        emHealthInsurance: 'Sind Sie gesetzlich krankenversichert?',
        emBudgetLimit: 'Wo liegt die Budgetgrenze für das Modell?',
        emWheelchairSpeed: 'Wie hoch soll die maximale Geschwindigkeit beim Elektrorollstuhl sein?',
        emWheelchairRange: 'Welche Reichweite soll der Elektrorollstuhl haben?',
        emScooterSpeed: 'Wie hoch soll die maximale Geschwindigkeit beim Elektromobil sein?',
        emScooterRange: 'Welche Reichweite soll das Elektromobil haben?',
        emTimeFrame: 'Wann wird das Elektromobil / der Elektrorollstuhl benötigt?',
      };

      const formattedAnswers: Array<{ question_code: string; question_label: string; value_raw: string }> = [];
      Object.entries(answers).forEach(([key, val]) => {
        if (val) {
          formattedAnswers.push({
            question_code: key,
            question_label: questionLabels[key] || key,
            value_raw: String(val),
          });
        }
      });

      const cleanPhone = telefonnummer.trim();
      const phoneE164 = cleanPhone.startsWith('+') ? cleanPhone : '+49' + cleanPhone.replace(/^0/, '');
      const leadId = 'lead-' + Date.now();

      const projectUuidMap: Record<string, string> = {
        PV: 'cccccccc-0000-0000-0000-000000000001',
        Photovoltaik: 'cccccccc-0000-0000-0000-000000000001',
        WP: 'cccccccc-0000-0000-0000-000000000002',
        Wärmepumpe: 'cccccccc-0000-0000-0000-000000000002',
        Treppenlift: 'cccccccc-0000-0000-0000-000000000003',
        Badsanierung: 'cccccccc-0000-0000-0000-000000000004',
        'Elektromobil / Elektrorollstuhl': 'cccccccc-0000-0000-0000-000000000005',
        Elektromobil: 'cccccccc-0000-0000-0000-000000000005',
      };

      const projectIconMap: Record<string, string> = {
        PV: 'Sun',
        Photovoltaik: 'Sun',
        WP: 'Flame',
        Wärmepumpe: 'Flame',
        Treppenlift: 'MoveUp',
        Badsanierung: 'Bath',
        'Elektromobil / Elektrorollstuhl': 'Accessibility',
        Elektromobil: 'Accessibility',
      };

      const newLeadObj = {
        id: leadId,
        first_name: vorname.trim(),
        last_name: nachname.trim(),
        phone_raw: cleanPhone,
        phone_e164: phoneE164,
        line_type: cleanPhone.startsWith('015') || cleanPhone.startsWith('016') || cleanPhone.startsWith('017') || cleanPhone.startsWith('+4915') || cleanPhone.startsWith('+4916') || cleanPhone.startsWith('+4917') ? 'MOBILE' : 'FIXED_LINE',
        email: email.trim() || null,
        postal_code: plz.trim() || null,
        city: ort.trim() || null,
        street: adresse.trim() || null,
        house_number: '',
        status: 'NEW',
        consent_verified: true,
        dnc_flag: false,
        created_at: new Date().toISOString(),
        project_id: projectUuidMap[selectedProject] || 'cccccccc-0000-0000-0000-000000000001',
        project_name: selectedProject === 'PV' ? 'Photovoltaik' : selectedProject,
        project_slug: selectedProject.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        project_icon: projectIconMap[selectedProject] || 'Sun',
        source: 'Agent-Erfassung (' + agentName + ')',
        formattedAnswers,
        answers,
        notiz: notiz.trim() || undefined,
        audioFileName: audioFileName || undefined,
        provenance: [
          {
            id: 'prov-' + leadId,
            source: 'Agent-Erfassung (' + agentName + ')',
            campaign_name: selectedProject,
            opt_in_timestamp: new Date().toISOString(),
            consent_text: 'Ausdrückliche Werbeeinwilligung telefonisch erteilt (UWG § 7).',
            consent_version: 'v2.1',
            consent_channel: 'PHONE',
          },
        ],
      };

      // Save to linkora_custom_leads in localStorage for admin panel
      const existingLeads = JSON.parse(localStorage.getItem('linkora_custom_leads') || '[]');
      const leadsToSave = [newLeadObj];

      // If additional projects checked, generate lead for each project
      additionalProjects.forEach((proj) => {
        const extraLeadId = 'lead-' + Date.now() + '-' + proj.toLowerCase().replace(/[^a-z0-9]/g, '-');
        leadsToSave.push({
          ...newLeadObj,
          id: extraLeadId,
          project_id: projectUuidMap[proj] || 'cccccccc-0000-0000-0000-000000000001',
          project_name: proj === 'PV' ? 'Photovoltaik' : proj,
          project_slug: proj.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          project_icon: projectIconMap[proj] || 'Sun',
          source: `Agent-Erfassung (Cross-Project: ${proj})`,
        });
      });

      localStorage.setItem('linkora_custom_leads', JSON.stringify([...leadsToSave, ...existingLeads]));

      // Also post to backend API (primary project and any cross-project leads)
      try {
        const primaryProjectId = projectUuidMap[selectedProject] || 'cccccccc-0000-0000-0000-000000000001';

        await fetch('/api/v1/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId: primaryProjectId,
            projectName: selectedProject === 'PV' ? 'Photovoltaik' : selectedProject,
            firstName: vorname.trim(),
            lastName: nachname.trim(),
            phone: phoneE164,
            phoneCountry: 'DE',
            email: email.trim() || undefined,
            street: adresse.trim() || undefined,
            postalCode: plz.trim() || undefined,
            city: ort.trim() || undefined,
            salutation: anrede,
            source: 'Agent-Erfassung (' + agentName + ')',
            provenance: {
              source: 'Agent-Erfassung (' + agentName + ')',
              campaignName: selectedProject,
              optInTimestamp: new Date().toISOString(),
              consentText: 'Ausdrückliche Werbeeinwilligung telefonisch erteilt (UWG § 7).',
              consentVersion: 'v2.1',
              consentChannel: 'PHONE',
            },
            notes: notiz.trim() || undefined,
            notiz: notiz.trim() || undefined,
            answers,
            formattedAnswers,
            callbackAt: wiedervorlageDate || undefined,
            audioFileName: audioFileName || undefined,
          }),
        });

        // Also post each additional checked project as a separate lead
        for (const extraProj of additionalProjects) {
          const extraProjId = projectUuidMap[extraProj] || 'cccccccc-0000-0000-0000-000000000001';
          await fetch('/api/v1/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              projectId: extraProjId,
              projectName: extraProj === 'PV' ? 'Photovoltaik' : extraProj,
              firstName: vorname.trim(),
              lastName: nachname.trim(),
              phone: phoneE164,
              phoneCountry: 'DE',
              email: email.trim() || undefined,
              street: adresse.trim() || undefined,
              postalCode: plz.trim() || undefined,
              city: ort.trim() || undefined,
              salutation: anrede,
              source: `Agent-Erfassung (${agentName} - Cross-Project: ${extraProj})`,
              provenance: {
                source: `Agent-Erfassung (${agentName} - Cross-Project: ${extraProj})`,
                campaignName: extraProj,
                optInTimestamp: new Date().toISOString(),
                consentText: 'Ausdrückliche Werbeeinwilligung telefonisch erteilt (UWG § 7).',
                consentVersion: 'v2.1',
                consentChannel: 'PHONE',
              },
              notes: notiz.trim() || undefined,
              notiz: notiz.trim() || undefined,
              answers: {},
              formattedAnswers: [],
              callbackAt: wiedervorlageDate || undefined,
              audioFileName: audioFileName || undefined,
            }),
          });
        }
      } catch {
        // Handled
      }

      // If Wiedervorlage is given, save to callback store
      if (wiedervorlageDate) {
        const callbackEntry = {
          id: 'cb-' + Date.now(),
          customerName: `${anrede} ${vorname} ${nachname}`.trim(),
          phone: telefonnummer.trim(),
          project: selectedProject,
          dueAt: wiedervorlageDate,
          agentName,
          note: notiz.trim() || 'Wiedervorlage aus Erfassungsformular',
        };
        const existingCb = JSON.parse(localStorage.getItem('linkora_custom_callbacks') || '[]');
        localStorage.setItem('linkora_custom_callbacks', JSON.stringify([callbackEntry, ...existingCb]));
        showToast('📅 Wiedervorlage gespeichert! Erinnerung wurde zu den Rückrufen hinzugefügt.');
      } else {
        showToast(`✅ Kunde "${vorname} ${nachname}" für Projekt "${selectedProject}" erfolgreich angelegt!`);
      }

      // Redirect back to dashboard after 1.5s
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell isAgentView={true}>
      <div className="max-w-7xl mx-auto space-y-5 animate-in fade-in duration-200 select-none pb-12">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-16 right-5 z-50 bg-[#090e1a] text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 text-xs flex items-center gap-2.5 animate-in slide-in-from-top-3 duration-200">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN: Customer Form Card */}
          <div className="lg:col-span-8 space-y-4">
            {/* Back Button */}
            <div>
              <Link
                href="/dashboard"
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 text-xs font-semibold px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500" />
                <span>Zum Dashboard zurück</span>
              </Link>
            </div>

            {/* Main Form Box */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/90">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mb-6">
                Neuen Kunden hinzufügen
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Project Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Projekt <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium cursor-pointer"
                    >
                      <option value="">Bitte zuerst Projekt wählen...</option>
                      <option value="PV">PV (Photovoltaik)</option>
                      <option value="Treppenlift">Treppenlift</option>
                      <option value="WP">WP (Wärmepumpe)</option>
                      <option value="Badsanierung">Badsanierung</option>
                      <option value="Elektromobil / Elektrorollstuhl">Elektromobil / Elektrorollstuhl</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* State A: Before Project Selection */}
                {!selectedProject && (
                  <div className="space-y-5 pt-2">
                    <p className="text-xs text-slate-500 italic">
                      Bitte zuerst oben ein Projekt wählen.
                    </p>

                    {/* Wiedervorlage Box */}
                    <div className="bg-sky-50/70 border border-sky-200/90 rounded-2xl p-4 sm:p-5 text-xs text-sky-900 space-y-2">
                      <div className="font-bold flex items-center gap-1.5 text-slate-800">
                        <Calendar className="w-4 h-4 text-sky-600" />
                        <span>Wiedervorlage (erneute Erinnerung — optional)</span>
                      </div>
                      <input
                        type="datetime-local"
                        value={wiedervorlageDate}
                        onChange={(e) => setWiedervorlageDate(e.target.value)}
                        className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 w-full sm:w-72 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                      />
                      <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                        Wann rufen Sie diesen Kunden erneut an? Wenn der Tag kommt Rückrufe'da
                        hatırlatılır. Tarih girilirse kayıt yalnız hatırlatmadır: satış sayılmaz,
                        partnere gönderilmez. Tekrar arayıp satış olursa satışı ayrıca kaydet.
                      </p>
                    </div>

                    {/* Blue Submit Button */}
                    <div>
                      <button
                        type="submit"
                        className="w-full bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-bold py-3 rounded-xl shadow-xs transition flex items-center justify-center gap-2 text-xs cursor-pointer active:scale-[0.99]"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Kunde hinzufügen</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* State B: When Project is Selected */}
                {selectedProject && (
                  <div className="space-y-6 pt-2 animate-in fade-in duration-200">
                    {/* Common Customer Fields Grid */}
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Kundenstammdaten
                      </h2>

                      {/* Anrede */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Anrede <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={anrede}
                          onChange={(e) => setAnrede(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                        >
                          <option value="">Bitte wählen…</option>
                          <option value="Herr">Herr</option>
                          <option value="Frau">Frau</option>
                          <option value="Familie">Familie</option>
                          <option value="Firma">Firma</option>
                        </select>
                      </div>

                      {/* Vorname & Nachname */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Vorname <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={vorname}
                            onChange={(e) => setVorname(e.target.value)}
                            placeholder="z.B. Max"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Nachname <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={nachname}
                            onChange={(e) => setNachname(e.target.value)}
                            placeholder="z.B. Mustermann"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                          />
                        </div>
                      </div>

                      {/* Adresse (Straße & Hausnummer) */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Adresse <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={adresse}
                          onChange={(e) => setAdresse(e.target.value)}
                          placeholder="z.B. Hauptstraße 12"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                        />
                      </div>

                      {/* PLZ & Ort */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            PLZ <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={plz}
                            onChange={(e) => handlePlzChange(e.target.value)}
                            placeholder="z.B. 10115"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Ort <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={ort}
                            onChange={(e) => setOrt(e.target.value)}
                            placeholder="z.B. Berlin"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                          />
                        </div>
                      </div>

                      {/* Telefonnummer & E-Mail */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Telefonnummer <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={telefonnummer}
                            onChange={(e) => setTelefonnummer(e.target.value)}
                            placeholder="z.B. 0176 1234567"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            E-Mail {(selectedProject === 'PV' || selectedProject === 'Treppenlift') && <span className="text-rose-500">*</span>}
                          </label>
                          <input
                            type="email"
                            required={selectedProject === 'PV' || selectedProject === 'Treppenlift'}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="kunde@example.de"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                          />
                        </div>
                      </div>

                      {/* Sprachaufnahme */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Sprachaufnahme
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3.5 py-2 rounded-xl text-xs font-medium cursor-pointer inline-flex items-center gap-1.5 transition">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Dosya seç</span>
                            <input
                              type="file"
                              accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.webm"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                          <span className="text-xs text-slate-500">
                            {audioFileName || 'Dosya seçilmedi'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          MP3, WAV, M4A, AAC, OGG, WEBM · max. 50 MB
                        </p>
                      </div>

                      {/* Notiz */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Notiz</label>
                        <textarea
                          rows={2}
                          value={notiz}
                          onChange={(e) => setNotiz(e.target.value)}
                          placeholder="Zusätzliche Bemerkungen des Kunden oder Vereinbarungen..."
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                        ></textarea>
                      </div>
                    </div>

                    {/* PROJECT QUESTIONNAIRE 1: PV (PHOTOVOLTAIK) */}
                    {selectedProject === 'PV' && (
                      <div className="space-y-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold">
                            PV
                          </span>
                          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                            Projektspezifische Fragen (Photovoltaik)
                          </h2>
                        </div>

                        {/* Wo möchten Sie die PV installieren? */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Wo möchten Sie die Photovoltaik installieren? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={pvInstallLocation}
                            onChange={(e) => setPvInstallLocation(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Einfamilienhaus (EFH)">Einfamilienhaus (EFH)</option>
                            <option value="Zweifamilienhaus (ZFH)">Zweifamilienhaus (ZFH)</option>
                            <option value="Mehrfamilienhaus (MFH)">Mehrfamilienhaus (MFH)</option>
                            <option value="Gewerbeimmobilie / Halle">Gewerbeimmobilie / Halle</option>
                            <option value="Freifläche">Freifläche</option>
                          </select>
                        </div>

                        {/* Wie alt ist Ihr Dach? */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Wie alt ist Ihr Dach? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={pvRoofAge}
                            onChange={(e) => setPvRoofAge(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Unter 10 Jahre">Unter 10 Jahre</option>
                            <option value="10 bis 20 Jahre">10 bis 20 Jahre</option>
                            <option value="20 bis 30 Jahre">20 bis 30 Jahre</option>
                            <option value="Über 30 Jahre (Sanierungsbedürftig)">Über 30 Jahre (Sanierungsbedürftig)</option>
                          </select>
                        </div>

                        {/* Wie groß ist Ihre nutzbare Dachfläche? */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Wie groß ist Ihre nutzbare Dachfläche? <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={pvRoofArea}
                            onChange={(e) => setPvRoofArea(e.target.value)}
                            placeholder="z.B. 75 m²"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                          />
                        </div>

                        {/* Welche Dachform hat Ihr Haus? */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Welche Dachform hat Ihr Haus? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={pvRoofShape}
                            onChange={(e) => setPvRoofShape(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Satteldach">Satteldach</option>
                            <option value="Flachdach">Flachdach</option>
                            <option value="Pultdach">Pultdach</option>
                            <option value="Walmdach">Walmdach</option>
                            <option value="Mansarddach">Mansarddach</option>
                          </select>
                        </div>

                        {/* Womit ist ihr Dach gedeckt? (Dachdeckungstyp) */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Womit ist ihr Dach gedeckt? (Dachdeckungstyp) <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={pvRoofCover}
                            onChange={(e) => setPvRoofCover(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Ziegel / Dachpfannen">Ziegel / Dachpfannen</option>
                            <option value="Schiefer">Schiefer</option>
                            <option value="Trapezblech / Metall">Trapezblech / Metall</option>
                            <option value="Bitumen / Teerpappe">Bitumen / Teerpappe</option>
                            <option value="Reet / Stroh (Ausschluss)">Reet / Stroh (Ausschluss)</option>
                            <option value="Asbest / Welleternit (Ausschluss)">Asbest / Welleternit (Ausschluss)</option>
                          </select>
                        </div>

                        {/* Eigentümer/Entscheider? */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Handelt es sich bei dem Interessenten um den Eigentümer/Entscheider? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={pvIsOwner}
                            onChange={(e) => setPvIsOwner(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Ja, Alleineigentümer">Ja, Alleineigentümer</option>
                            <option value="Ja, Miteigentümer (z.B. Ehepartner)">Ja, Miteigentümer (z.B. Ehepartner)</option>
                            <option value="Nein, Mieter (Ausschluss)">Nein, Mieter (Ausschluss)</option>
                          </select>
                        </div>

                        {/* Wann soll die Photovoltaik installiert werden? */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Wann soll die Photovoltaik installiert werden? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={pvInstallTime}
                            onChange={(e) => setPvInstallTime(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Schnellstmöglich (in 1-3 Monaten)">Schnellstmöglich (in 1-3 Monaten)</option>
                            <option value="In 3-6 Monaten">In 3-6 Monaten</option>
                            <option value="In 6-12 Monaten">In 6-12 Monaten</option>
                            <option value="Nur unverbindliche Preisinformation">Nur unverbindliche Preisinformation</option>
                          </select>
                        </div>

                        {/* Welche Finanzierung kommt für Sie in Frage? */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Welche Finanzierung kommt für Sie in Frage? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={pvFinancing}
                            onChange={(e) => setPvFinancing(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Barkauf / Eigenkapital">Barkauf / Eigenkapital</option>
                            <option value="Finanzierung / Ratenkauf">Finanzierung / Ratenkauf</option>
                            <option value="Miete / Pacht">Miete / Pacht</option>
                            <option value="Noch unentschlossen">Noch unentschlossen</option>
                          </select>
                        </div>

                        {/* Wie ist Ihr Dach ausgerichtet? */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Wie ist Ihr Dach ausgerichtet? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={pvRoofOrientation}
                            onChange={(e) => setPvRoofOrientation(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Südausrichtung (Optimal)">Südausrichtung (Optimal)</option>
                            <option value="Ost-West-Ausrichtung">Ost-West-Ausrichtung</option>
                            <option value="Süd-Ost / Süd-West">Süd-Ost / Süd-West</option>
                            <option value="Nordausrichtung">Nordausrichtung</option>
                          </select>
                        </div>

                        {/* Stromverbrauch in kWh/Jahr */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Stromverbrauch in kWh/Jahr <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={pvPowerConsumption}
                            onChange={(e) => setPvPowerConsumption(e.target.value)}
                            placeholder="z.B. 4.500 kWh"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                          />
                        </div>

                        {/* Stromspeicher gewünscht? */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Stromspeicher gewünscht?
                          </label>
                          <select
                            value={pvBatteryStorage}
                            onChange={(e) => setPvBatteryStorage(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Ja, Speicher unbedingt gewünscht">Ja, Speicher unbedingt gewünscht</option>
                            <option value="Ja, Beratung zu Speicher gewünscht">Ja, Beratung zu Speicher gewünscht</option>
                            <option value="Nein, kein Speicher">Nein, kein Speicher</option>
                          </select>
                        </div>

                        {/* Erreichbarkeit? */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Erreichbarkeit?
                          </label>
                          <select
                            value={pvAvailability}
                            onChange={(e) => setPvAvailability(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Vormittags (09:00 - 12:00)">Vormittags (09:00 - 12:00)</option>
                            <option value="Nachmittags (12:00 - 17:00)">Nachmittags (12:00 - 17:00)</option>
                            <option value="Abends (17:00 - 20:00)">Abends (17:00 - 20:00)</option>
                            <option value="Jederzeit erreichbar">Jederzeit erreichbar</option>
                          </select>
                        </div>

                        {/* Kunde möchte auch andere Projekte */}
                        <div className="pt-3 border-t border-slate-100">
                          <label className="block text-xs font-bold text-slate-800 mb-2">
                            Kunde möchte auch andere Projekte (je Projekt ein eigener Lead)
                          </label>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={alsoWp}
                                onChange={(e) => setAlsoWp(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="font-semibold text-slate-700">WP (Wärmepumpe)</span>
                            </label>
                            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={alsoTreppenlift}
                                onChange={(e) => setAlsoTreppenlift(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="font-semibold text-slate-700">Treppenlift</span>
                            </label>
                            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={alsoBadsanierung}
                                onChange={(e) => setAlsoBadsanierung(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="font-semibold text-slate-700">Badsanierung</span>
                            </label>
                            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={alsoElektromobil}
                                onChange={(e) => setAlsoElektromobil(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="font-semibold text-slate-700">Elektromobil / Elektrorollstuhl</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PROJECT QUESTIONNAIRE 2: TREPPENLIFT */}
                    {selectedProject === 'Treppenlift' && (
                      <div className="space-y-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-xs font-extrabold">
                            Treppenlift
                          </span>
                          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                            Projektspezifische Fragen (Treppenlift)
                          </h2>
                        </div>

                        {/* Was für einen Lift suchen Sie? */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Was für einen Lift suchen Sie? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={tlLiftType}
                            onChange={(e) => setTlLiftType(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Klassischer Treppenlift (Sitzlift)">Klassischer Treppenlift (Sitzlift)</option>
                            <option value="Plattformlift (Rollstuhllift)">Plattformlift (Rollstuhllift)</option>
                            <option value="Hublift / Hebebühne">Hublift / Hebebühne</option>
                            <option value="Homelift / Senkrechtlift">Homelift / Senkrechtlift</option>
                          </select>
                        </div>

                        {/* Um welchen Gebäudetyp handelt es sich? */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Um welchen Gebäudetyp handelt es sich? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={tlBuildingType}
                            onChange={(e) => setTlBuildingType(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Einfamilienhaus (EFH)">Einfamilienhaus (EFH)</option>
                            <option value="Mehrfamilienhaus (MFH)">Mehrfamilienhaus (MFH)</option>
                            <option value="Reihenhaus / Doppelhaushälfte">Reihenhaus / Doppelhaushälfte</option>
                            <option value="Mietwohnung (Vermieterzustimmung erforderlich)">Mietwohnung (Vermieterzustimmung erforderlich)</option>
                          </select>
                        </div>

                        {/* Welches Nutzergewicht soll der Lift befördern? */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Welches Nutzergewicht soll der Lift befördern? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={tlUserWeight}
                            onChange={(e) => setTlUserWeight(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Bis 120 kg (Standard)">Bis 120 kg (Standard)</option>
                            <option value="120 - 160 kg (Verstärkt)">120 - 160 kg (Verstärkt)</option>
                            <option value="Über 160 kg (Schwerlastlift)">Über 160 kg (Schwerlastlift)</option>
                          </select>
                        </div>

                        {/* Wann wird der Lift benötigt? */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Wann wird der Lift benötigt? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={tlTimeFrame}
                            onChange={(e) => setTlTimeFrame(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Dringend / Schnellstmöglich (Akutfall)">Dringend / Schnellstmöglich (Akutfall)</option>
                            <option value="In 1-3 Monaten">In 1-3 Monaten</option>
                            <option value="In 3-6 Monaten">In 3-6 Monaten</option>
                            <option value="Vorsorgliche Beratung">Vorsorgliche Beratung</option>
                          </select>
                        </div>

                        {/* Sind Sie Eigentümer/Entscheider */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Sind Sie Eigentümer/Entscheider <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={tlIsOwner}
                            onChange={(e) => setTlIsOwner(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Ja, Eigentümer des Hauses">Ja, Eigentümer des Hauses</option>
                            <option value="Angehöriger / Betreuer des Eigentümers">Angehöriger / Betreuer des Eigentümers</option>
                            <option value="Mieter (Eigentümer ist informiert)">Mieter (Eigentümer ist informiert)</option>
                          </select>
                        </div>

                        {/* Wie viele Etagen müssen überwunden werden? */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Wie viele Etagen müssen überwunden werden?
                          </label>
                          <select
                            value={tlFloors}
                            onChange={(e) => setTlFloors(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="1 Etage">1 Etage</option>
                            <option value="2 Etagen">2 Etagen</option>
                            <option value="3 oder mehr Etagen">3 oder mehr Etagen</option>
                            <option value="Nur wenige Stufen / Eingangsbereich">Nur wenige Stufen / Eingangsbereich</option>
                          </select>
                        </div>

                        {/* Liegt ein Pflegegrad vor? */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Liegt ein Pflegegrad vor?
                          </label>
                          <select
                            value={tlCareLevel}
                            onChange={(e) => setTlCareLevel(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Ja, Pflegegrad 1">Ja, Pflegegrad 1</option>
                            <option value="Ja, Pflegegrad 2">Ja, Pflegegrad 2</option>
                            <option value="Ja, Pflegegrad 3">Ja, Pflegegrad 3</option>
                            <option value="Ja, Pflegegrad 4 oder 5">Ja, Pflegegrad 4 oder 5</option>
                            <option value="Nein, aber Pflegegrad ist beantragt">Nein, aber Pflegegrad ist beantragt</option>
                            <option value="Nein, kein Pflegegrad (Selbstzahler)">Nein, kein Pflegegrad (Selbstzahler)</option>
                          </select>
                        </div>

                        {/* Wie verläuft die Treppe? */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Wie verläuft die Treppe?
                          </label>
                          <select
                            value={tlStairCourse}
                            onChange={(e) => setTlStairCourse(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Gerade Treppe">Gerade Treppe</option>
                            <option value="Kurvige Treppe (mit 1 Kurve/Podest)">Kurvige Treppe (mit 1 Kurve/Podest)</option>
                            <option value="Kurvige Treppe (mit mehreren Kurven)">Kurvige Treppe (mit mehreren Kurven)</option>
                            <option value="Wendeltreppe">Wendeltreppe</option>
                          </select>
                        </div>

                        {/* Mobilität des Nutzers */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Mobilität des Nutzers
                          </label>
                          <select
                            value={tlMobility}
                            onChange={(e) => setTlMobility(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Kann selbstständig stehen und umsteigen">Kann selbstständig stehen und umsteigen</option>
                            <option value="Eingeschränkt mobil (Rollator)">Eingeschränkt mobil (Rollator)</option>
                            <option value="Auf Rollstuhl angewiesen">Auf Rollstuhl angewiesen</option>
                          </select>
                        </div>

                        {/* Treppenmaße (Breite, Stufen, Höhenunterschied) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Treppenbreite (in cm)
                            </label>
                            <input
                              type="text"
                              value={tlStairWidth}
                              onChange={(e) => setTlStairWidth(e.target.value)}
                              placeholder="z.B. 85"
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Anzahl der Stufen
                            </label>
                            <input
                              type="text"
                              value={tlStepCount}
                              onChange={(e) => setTlStepCount(e.target.value)}
                              placeholder="z.B. 14"
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Höhenunterschied (in cm)
                            </label>
                            <input
                              type="text"
                              value={tlHeightDiff}
                              onChange={(e) => setTlHeightDiff(e.target.value)}
                              placeholder="z.B. 260"
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                            />
                          </div>
                        </div>

                        {/* Wird der Lift im Außenbereich benötigt? */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Wird der Lift im Außenbereich benötigt?
                          </label>
                          <select
                            value={tlOutdoor}
                            onChange={(e) => setTlOutdoor(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Nein, im Innenbereich">Nein, im Innenbereich</option>
                            <option value="Ja, im Außenbereich (Wetterfest)">Ja, im Außenbereich (Wetterfest)</option>
                          </select>
                        </div>

                        {/* Treppenlift · Erreichbarkeit */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Treppenlift · Erreichbarkeit
                          </label>
                          <select
                            value={tlAvailability}
                            onChange={(e) => setTlAvailability(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Vormittags (09:00 - 12:00)">Vormittags (09:00 - 12:00)</option>
                            <option value="Nachmittags (12:00 - 17:00)">Nachmittags (12:00 - 17:00)</option>
                            <option value="Abends (17:00 - 20:00)">Abends (17:00 - 20:00)</option>
                            <option value="Jederzeit erreichbar">Jederzeit erreichbar</option>
                          </select>
                        </div>

                        {/* Kunde möchte auch andere Projekte */}
                        <div className="pt-3 border-t border-slate-100">
                          <label className="block text-xs font-bold text-slate-800 mb-2">
                            Kunde möchte auch andere Projekte (je Projekt ein eigener Lead)
                          </label>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={alsoPv}
                                onChange={(e) => setAlsoPv(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="font-semibold text-slate-700">PV</span>
                            </label>
                            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={alsoWp}
                                onChange={(e) => setAlsoWp(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="font-semibold text-slate-700">WP</span>
                            </label>
                            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={alsoBadsanierung}
                                onChange={(e) => setAlsoBadsanierung(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="font-semibold text-slate-700">Badsanierung</span>
                            </label>
                            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={alsoElektromobil}
                                onChange={(e) => setAlsoElektromobil(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="font-semibold text-slate-700">Elektromobil / Elektrorollstuhl</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PROJECT QUESTIONNAIRE 3: WP (WÄRMEPUMPE) */}
                    {selectedProject === 'WP' && (
                      <div className="space-y-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold">
                            WP
                          </span>
                          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                            Projektspezifische Fragen (Wärmepumpe)
                          </h2>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Aktuelles Heizsystem? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={wpCurrentSystem}
                            onChange={(e) => setWpCurrentSystem(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Gasheizung">Gasheizung</option>
                            <option value="Ölheizung">Ölheizung</option>
                            <option value="Pellet / Holz">Pellet / Holz</option>
                            <option value="Nachtspeicher / Strom">Nachtspeicher / Strom</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Alter der Heizung? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={wpHeatingAge}
                            onChange={(e) => setWpHeatingAge(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Unter 10 Jahre">Unter 10 Jahre</option>
                            <option value="10 bis 20 Jahre">10 bis 20 Jahre</option>
                            <option value="Über 20 Jahre">Über 20 Jahre</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Wohnfläche (in m²)? <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={wpLivingSpace}
                            onChange={(e) => setWpLivingSpace(e.target.value)}
                            placeholder="z.B. 140 m²"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Wann soll die Wärmepumpe installiert werden? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={wpInstallTime}
                            onChange={(e) => setWpInstallTime(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Schnellstmöglich">Schnellstmöglich</option>
                            <option value="In 3-6 Monaten">In 3-6 Monaten</option>
                            <option value="In 6-12 Monaten">In 6-12 Monaten</option>
                          </select>
                        </div>

                        {/* Kunde möchte auch andere Projekte (je Projekt ein eigener Lead) */}
                        <div className="pt-3 border-t border-slate-100">
                          <label className="block text-xs font-bold text-slate-800 mb-2">
                            Kunde möchte auch andere Projekte (je Projekt ein eigener Lead)
                          </label>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={alsoPv}
                                onChange={(e) => setAlsoPv(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="font-semibold text-slate-700">PV</span>
                            </label>
                            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={alsoTreppenlift}
                                onChange={(e) => setAlsoTreppenlift(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="font-semibold text-slate-700">Treppenlift</span>
                            </label>
                            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={alsoBadsanierung}
                                onChange={(e) => setAlsoBadsanierung(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="font-semibold text-slate-700">Badsanierung</span>
                            </label>
                            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={alsoElektromobil}
                                onChange={(e) => setAlsoElektromobil(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="font-semibold text-slate-700">Elektromobil / Elektrorollstuhl</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PROJECT QUESTIONNAIRE 4: BADSANIERUNG */}
                    {selectedProject === 'Badsanierung' && (
                      <div className="space-y-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-900 text-xs font-extrabold flex items-center gap-1">
                            <Bath className="w-3.5 h-3.5" />
                            <span>Badsanierung</span>
                          </span>
                          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                            Projektspezifische Fragen (Badsanierung)
                          </h2>
                        </div>

                        {/* 1. Welches Badprojekt möchten Sie angehen? * */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Welches Badprojekt möchten Sie angehen? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={badProjectType}
                            onChange={(e) => setBadProjectType(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Komplettbadsanierung">Komplettbadsanierung</option>
                            <option value="Teilsanierung (z.B. Wanne zur Dusche)">Teilsanierung (z.B. Wanne zur Dusche)</option>
                            <option value="Barrierefreier / Altersgerechter Umbau">Barrierefreier / Altersgerechter Umbau</option>
                            <option value="Gäste-WC Sanierung">Gäste-WC Sanierung</option>
                            <option value="Fliesen & Sanitär Erneuerung">Fliesen & Sanitär Erneuerung</option>
                            <option value="Sonstiges Badprojekt">Sonstiges Badprojekt</option>
                          </select>
                        </div>

                        {/* 2. Wie groß ist das Badezimmer? * */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Wie groß ist das Badezimmer? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={badSize}
                            onChange={(e) => setBadSize(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Bis 4 m² (sehr klein)">Bis 4 m² (sehr klein)</option>
                            <option value="4 bis 7 m² (Standard)">4 bis 7 m² (Standard)</option>
                            <option value="8 bis 12 m² (groß)">8 bis 12 m² (groß)</option>
                            <option value="Über 12 m² (großzügig / Wellness)">Über 12 m² (großzügig / Wellness)</option>
                            <option value="Nicht genau bekannt">Nicht genau bekannt</option>
                          </select>
                        </div>

                        {/* 3. Soll das Bad barrierefrei sein? * */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Soll das Bad barrierefrei sein? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={badBarrierFree}
                            onChange={(e) => setBadBarrierFree(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Ja, vollständig barrierefrei (DIN 18040-2)">Ja, vollständig barrierefrei (DIN 18040-2)</option>
                            <option value="Ja, seniorengerecht / bodengleiche Dusche">Ja, seniorengerecht / bodengleiche Dusche</option>
                            <option value="Nein, nicht erforderlich">Nein, nicht erforderlich</option>
                            <option value="Teilweise gewünscht">Teilweise gewünscht</option>
                          </select>
                        </div>

                        {/* 4. Welche Ausstattung wünschen Sie? * */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Welche Ausstattung wünschen Sie? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={badFeatures}
                            onChange={(e) => setBadFeatures(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Standard / Solide Grundausstattung">Standard / Solide Grundausstattung</option>
                            <option value="Gehobene Ausstattung (Markenhersteller)">Gehobene Ausstattung (Markenhersteller)</option>
                            <option value="Luxus / High-End Design">Luxus / High-End Design</option>
                            <option value="Nur das Nötigste / Funktional">Nur das Nötigste / Funktional</option>
                          </select>
                        </div>

                        {/* 5. Was darf der Badumbau kosten? * */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Was darf der Badumbau kosten? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={badBudget}
                            onChange={(e) => setBadBudget(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Bis 5.000 €">Bis 5.000 €</option>
                            <option value="5.000 € – 10.000 €">5.000 € – 10.000 €</option>
                            <option value="10.000 € – 15.000 €">10.000 € – 15.000 €</option>
                            <option value="15.000 € – 25.000 €">15.000 € – 25.000 €</option>
                            <option value="Über 25.000 €">Über 25.000 €</option>
                            <option value="Noch keine genaue Vorstellung / Kostenvoranschlag gewünscht">Noch keine genaue Vorstellung / Kostenvoranschlag gewünscht</option>
                          </select>
                        </div>

                        {/* 6. Wann wird der Badumbau benötigt? * */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Wann wird der Badumbau benötigt? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={badTimeFrame}
                            onChange={(e) => setBadTimeFrame(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Schnellstmöglich (Dringend)">Schnellstmöglich (Dringend)</option>
                            <option value="In 1 bis 3 Monaten">In 1 bis 3 Monaten</option>
                            <option value="In 3 bis 6 Monaten">In 3 bis 6 Monaten</option>
                            <option value="In mehr als 6 Monaten">In mehr als 6 Monaten</option>
                            <option value="Reine Orientierung / Preisvergleich">Reine Orientierung / Preisvergleich</option>
                          </select>
                        </div>

                        {/* 7. Sind Sie Eigentümer/Entscheider? * */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Sind Sie Eigentümer/Entscheider? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={badIsOwner}
                            onChange={(e) => setBadIsOwner(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Ja, Eigentümer / Alleinentscheider">Ja, Eigentümer / Alleinentscheider</option>
                            <option value="Ja, Miteigentümer">Ja, Miteigentümer</option>
                            <option value="Nein, Mieter (Vermieterzustimmung erforderlich)">Nein, Mieter (Vermieterzustimmung erforderlich)</option>
                          </select>
                        </div>

                        {/* Kunde möchte auch andere Projekte (je Projekt ein eigener Lead) */}
                        <div className="pt-3 border-t border-slate-100">
                          <label className="block text-xs font-bold text-slate-800 mb-2">
                            Kunde möchte auch andere Projekte (je Projekt ein eigener Lead)
                          </label>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={alsoPv}
                                onChange={(e) => setAlsoPv(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="font-semibold text-slate-700">PV</span>
                            </label>
                            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={alsoWp}
                                onChange={(e) => setAlsoWp(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="font-semibold text-slate-700">WP</span>
                            </label>
                            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={alsoTreppenlift}
                                onChange={(e) => setAlsoTreppenlift(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="font-semibold text-slate-700">Treppenlift</span>
                            </label>
                            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={alsoElektromobil}
                                onChange={(e) => setAlsoElektromobil(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="font-semibold text-slate-700">Elektromobil / Elektrorollstuhl</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PROJECT QUESTIONNAIRE 5: ELEKTROMOBIL / ELEKTROROLLSTUHL */}
                    {(selectedProject === 'Elektromobil / Elektrorollstuhl' || selectedProject === 'Elektromobil') && (
                      <div className="space-y-4 pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-xs font-extrabold flex items-center gap-1">
                            <Accessibility className="w-3.5 h-3.5" />
                            <span>Elektromobil / Elektrorollstuhl</span>
                          </span>
                          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                            Projektspezifische Fragen (Elektromobil / Elektrorollstuhl)
                          </h2>
                        </div>

                        {/* 1. Für welches Modell interessieren Sie sich? * */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Für welches Modell interessieren Sie sich? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={emModelType}
                            onChange={(e) => setEmModelType(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Elektromobil (Seniorenmobil / 4-Rad Scooter)">Elektromobil (Seniorenmobil / 4-Rad Scooter)</option>
                            <option value="Elektrorollstuhl (E-Rollstuhl)">Elektrorollstuhl (E-Rollstuhl)</option>
                            <option value="Faltbarer Reise-Elektrorollstuhl (Leichtgewicht)">Faltbarer Reise-Elektrorollstuhl (Leichtgewicht)</option>
                            <option value="Kabinenfahrzeug / Geschlossenes Elektromobil">Kabinenfahrzeug / Geschlossenes Elektromobil</option>
                            <option value="Noch unentschlossen / Beratung gewünscht">Noch unentschlossen / Beratung gewünscht</option>
                          </select>
                        </div>

                        {/* 2. Wo soll die überwiegende Nutzung stattfinden? * */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Wo soll die überwiegende Nutzung stattfinden? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={emUsageArea}
                            onChange={(e) => setEmUsageArea(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Nur im Außenbereich (Straße, Gehweg, Einkaufen)">Nur im Außenbereich (Straße, Gehweg, Einkaufen)</option>
                            <option value="Nur im Innenbereich (Wohnung, Haus)">Nur im Innenbereich (Wohnung, Haus)</option>
                            <option value="Sowohl Innen- als auch Außenbereich">Sowohl Innen- als auch Außenbereich</option>
                            <option value="Für unterwegs / Transport im Auto (faltbar)">Für unterwegs / Transport im Auto (faltbar)</option>
                          </select>
                        </div>

                        {/* 3. Für welches Gewicht muss das Modell geeignet sein? * */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Für welches Gewicht muss das Modell geeignet sein? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={emUserWeight}
                            onChange={(e) => setEmUserWeight(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Bis 100 kg">Bis 100 kg</option>
                            <option value="Bis 130 kg">Bis 130 kg</option>
                            <option value="Bis 160 kg">Bis 160 kg</option>
                            <option value="Über 160 kg (Bariatrisch / Schwerlast)">Über 160 kg (Bariatrisch / Schwerlast)</option>
                          </select>
                        </div>

                        {/* 4. Für wen ist das Elektromobil / der Elektrorollstuhl gedacht? * */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Für wen ist das Elektromobil / der Elektrorollstuhl gedacht? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={emTargetPerson}
                            onChange={(e) => setEmTargetPerson(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Für mich selbst">Für mich selbst</option>
                            <option value="Für Partner / Ehegatten">Für Partner / Ehegatten</option>
                            <option value="Für Eltern / Angehörige">Für Eltern / Angehörige</option>
                            <option value="Gesetzliche Betreuung / Pflegeperson">Gesetzliche Betreuung / Pflegeperson</option>
                          </select>
                        </div>

                        {/* 5. Sind Sie gesetzlich krankenversichert? * */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Sind Sie gesetzlich krankenversichert? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={emHealthInsurance}
                            onChange={(e) => setEmHealthInsurance(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Ja, gesetzlich versichert (GKV)">Ja, gesetzlich versichert (GKV)</option>
                            <option value="Nein, privat versichert (PKV)">Nein, privat versichert (PKV)</option>
                            <option value="Beihilfeberechtigt">Beihilfeberechtigt</option>
                            <option value="Selbstzahler">Selbstzahler</option>
                          </select>
                        </div>

                        {/* 6. Wo liegt die Budgetgrenze für das Modell? * */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Wo liegt die Budgetgrenze für das Modell? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={emBudgetLimit}
                            onChange={(e) => setEmBudgetLimit(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Bis 1.500 €">Bis 1.500 €</option>
                            <option value="1.500 € – 3.000 €">1.500 € – 3.000 €</option>
                            <option value="3.000 € – 5.000 €">3.000 € – 5.000 €</option>
                            <option value="Über 5.000 €">Über 5.000 €</option>
                            <option value="Kostenübernahme durch Krankenkasse erhofft (Rezept vorhanden / geplant)">Kostenübernahme durch Krankenkasse erhofft (Rezept vorhanden / geplant)</option>
                          </select>
                        </div>

                        {/* 7. Wie hoch soll die maximale Geschwindigkeit beim Elektrorollstuhl sein? */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Wie hoch soll die maximale Geschwindigkeit beim Elektrorollstuhl sein?
                          </label>
                          <select
                            value={emWheelchairSpeed}
                            onChange={(e) => setEmWheelchairSpeed(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="6 km/h (Standard für Bürgersteig & Innenbereich, führerscheinfrei)">6 km/h (Standard für Bürgersteig & Innenbereich, führerscheinfrei)</option>
                            <option value="10 km/h">10 km/h</option>
                            <option value="12 km/h">12 km/h</option>
                            <option value="15 km/h">15 km/h</option>
                          </select>
                        </div>

                        {/* 8. Welche Reichweite soll der Elektrorollstuhl haben? */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Welche Reichweite soll der Elektrorollstuhl haben?
                          </label>
                          <select
                            value={emWheelchairRange}
                            onChange={(e) => setEmWheelchairRange(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Bis 15 km (Stadt / Nahbereich)">Bis 15 km (Stadt / Nahbereich)</option>
                            <option value="15 – 25 km (Standard)">15 – 25 km (Standard)</option>
                            <option value="25 – 40 km (Große Reichweite)">25 – 40 km (Große Reichweite)</option>
                            <option value="Über 40 km">Über 40 km</option>
                          </select>
                        </div>

                        {/* 9. Wie hoch soll die maximale Geschwindigkeit beim Elektromobil sein? */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Wie hoch soll die maximale Geschwindigkeit beim Elektromobil sein?
                          </label>
                          <select
                            value={emScooterSpeed}
                            onChange={(e) => setEmScooterSpeed(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="6 km/h (führerscheinfrei, Gehweg)">6 km/h (führerscheinfrei, Gehweg)</option>
                            <option value="10 km/h">10 km/h</option>
                            <option value="12 km/h">12 km/h</option>
                            <option value="15 km/h (mit Zulassung/Haftpflicht)">15 km/h (mit Zulassung/Haftpflicht)</option>
                            <option value="20 km/h oder mehr">20 km/h oder mehr</option>
                          </select>
                        </div>

                        {/* 10. Welche Reichweite soll das Elektromobil haben? */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Welche Reichweite soll das Elektromobil haben?
                          </label>
                          <select
                            value={emScooterRange}
                            onChange={(e) => setEmScooterRange(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Bis 20 km">Bis 20 km</option>
                            <option value="20 – 35 km (Standard)">20 – 35 km (Standard)</option>
                            <option value="35 – 50 km (Erweiterte Reichweite)">35 – 50 km (Erweiterte Reichweite)</option>
                            <option value="Über 50 km (Langstrecke)">Über 50 km (Langstrecke)</option>
                          </select>
                        </div>

                        {/* 11. Wann wird das Elektromobil / der Elektrorollstuhl benötigt? * */}
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Wann wird das Elektromobil / der Elektrorollstuhl benötigt? <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={emTimeFrame}
                            onChange={(e) => setEmTimeFrame(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                          >
                            <option value="">Bitte wählen…</option>
                            <option value="Schnellstmöglich (dringender Mobilitätsbedarf)">Schnellstmöglich (dringender Mobilitätsbedarf)</option>
                            <option value="In 1 bis 3 Monaten">In 1 bis 3 Monaten</option>
                            <option value="In 3 bis 6 Monaten">In 3 bis 6 Monaten</option>
                            <option value="Reine Information / Angebot einholen">Reine Information / Angebot einholen</option>
                          </select>
                        </div>

                        {/* Kunde möchte auch andere Projekte (je Projekt ein eigener Lead) */}
                        <div className="pt-3 border-t border-slate-100">
                          <label className="block text-xs font-bold text-slate-800 mb-2">
                            Kunde möchte auch andere Projekte (je Projekt ein eigener Lead)
                          </label>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={alsoPv}
                                onChange={(e) => setAlsoPv(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="font-semibold text-slate-700">PV</span>
                            </label>
                            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={alsoWp}
                                onChange={(e) => setAlsoWp(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="font-semibold text-slate-700">WP</span>
                            </label>
                            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={alsoTreppenlift}
                                onChange={(e) => setAlsoTreppenlift(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="font-semibold text-slate-700">Treppenlift</span>
                            </label>
                            <label className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={alsoBadsanierung}
                                onChange={(e) => setAlsoBadsanierung(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className="font-semibold text-slate-700">Badsanierung</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Wiedervorlage Box */}
                    <div className="bg-sky-50/70 border border-sky-200/90 rounded-2xl p-4 sm:p-5 text-xs text-sky-900 space-y-2 pt-3">
                      <div className="font-bold flex items-center gap-1.5 text-slate-800">
                        <Calendar className="w-4 h-4 text-sky-600" />
                        <span>Wiedervorlage (erneute Erinnerung — optional)</span>
                      </div>
                      <input
                        type="datetime-local"
                        value={wiedervorlageDate}
                        onChange={(e) => setWiedervorlageDate(e.target.value)}
                        className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 w-full sm:w-72 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                      />
                      <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                        Wann rufen Sie diesen Kunden erneut an? Wenn der Tag kommt Rückrufe'da
                        hatırlatılır. Tarih girilirse kayıt yalnız hatırlatmadır: satış sayılmaz,
                        partnere gönderilmez. Tekrar arayıp satış olursa satışı ayrıca kaydet.
                      </p>
                    </div>

                    {/* Blue Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-bold py-3.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs cursor-pointer active:scale-[0.99] disabled:opacity-50"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>{isSubmitting ? 'Wird gespeichert...' : 'Kunde hinzufügen'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidecar with Dialer, Ranglisten & Live Chat */}
          <div className="lg:col-span-4 space-y-4">
            {/* Card 1: Manueller Anruf */}
            <div className="bg-white rounded-2xl p-4.5 sm:p-5 shadow-xs border border-slate-200/90 text-slate-800">
              <div className="flex items-center space-x-6 border-b border-slate-100 pb-2 mb-3.5">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b-2 border-slate-900 pb-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Manueller Anruf</span>
                </span>
                <span className="text-xs text-slate-400 font-medium">Son 48s</span>
                <span className="text-xs text-slate-400 font-medium">Schwebend</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nummer</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+49... / 0..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="mt-2.5">
                {!isOnCall ? (
                  <button
                    type="button"
                    onClick={handleManualCall}
                    disabled={isDialing}
                    className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>{isDialing ? 'Aranıyor...' : 'Manuell Anruf'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleHangup}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition flex items-center justify-center gap-2 text-sm cursor-pointer animate-pulse"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>Auflegen</span>
                  </button>
                )}
              </div>

              <div className="mt-3 text-xs text-slate-500 space-y-0.5">
                <div>{audioStatus}</div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                  <span>Ses: —</span>
                </div>
              </div>

              <div className="mt-3.5">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Kampagne</label>
                <div className="relative">
                  <select
                    value={selectedCampaign}
                    onChange={(e) => setSelectedCampaign(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 appearance-none focus:outline-none"
                  >
                    <option value="">— Kampagne wählen —</option>
                    <option value="Photovoltaik DE 2026">Photovoltaik DE 2026</option>
                    <option value="Wärmepumpe Direkt">Wärmepumpe Direkt</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
                {!selectedCampaign && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium leading-tight">
                    Size atanmış kampanya yok. Firma yöneticinizden kampanya açmasını isteyin.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => showToast('Auto-Dialer gestartet')}
                  className="bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-1.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Start</span>
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Auto-Dialer pausiert')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Pause className="w-3 h-3 fill-slate-700" />
                  <span>Pause</span>
                </button>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1 text-xs">
                <button
                  type="button"
                  onClick={playTestTone}
                  className="text-sky-600 hover:underline flex items-center gap-1.5 cursor-pointer block"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Tontest</span>
                </button>
                <button
                  type="button"
                  onClick={() => showToast('Audio-Gerät: Standard-Headset aktiv')}
                  className="text-sky-600 hover:underline flex items-center gap-1.5 cursor-pointer block"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Gerät wählen (Mikrofon/Lautsprecher)</span>
                </button>
                <button
                  type="button"
                  onClick={handleRepairAudio}
                  className="text-rose-500 hover:underline flex items-center gap-1.5 cursor-pointer block"
                >
                  <X className="w-3.5 h-3.5 text-rose-500" />
                  <span>Gibt es ein Problem? (Anruf reparieren)</span>
                </button>
              </div>

              <div className="mt-3.5 bg-sky-50 border border-sky-200/90 rounded-xl p-3 text-xs text-sky-900 leading-relaxed">
                Beim ersten Anruf wird die Mikrofonberechtigung angefragt. Anrufer-ID:{' '}
                <span className="font-bold text-rose-600">{assignedCallerId}</span>
              </div>
            </div>

            {/* Card 2: Tagesrangliste */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 text-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-bold text-slate-900">Tagesrangliste (31.10.2026)</h2>
                <span className="bg-[#16a34a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  <span>Live</span>
                </span>
              </div>
              <div className="py-3 text-center text-xs text-slate-400 font-medium">
                Keine Daten verfügbar
              </div>
            </div>

            {/* Card 3: Monatsrangliste */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 text-slate-800">
              <h2 className="text-xs font-bold text-slate-900 mb-2.5">
                Monatsrangliste (10/2026)
              </h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-1 px-2 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <span className="text-base">🏆</span>
                    <span>Murat Dere</span>
                  </div>
                  <span className="text-emerald-600 font-extrabold text-xs">203</span>
                </div>

                <div className="flex items-center justify-between py-1 px-2 rounded-xl">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                    <span className="text-base">🥈</span>
                    <span>Murat.D</span>
                  </div>
                  <span className="text-emerald-600 font-extrabold text-xs">8</span>
                </div>
              </div>
            </div>

            {/* Card 4: Chat */}
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200/90 text-slate-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-slate-700" />
                  <h2 className="text-xs font-bold text-slate-900">Chat</h2>
                </div>
                <span className="bg-[#16a34a] text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  <span>Live</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded-xl mb-3">
                <button
                  type="button"
                  onClick={() => setChatTab('TEAM')}
                  className={`py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                    chatTab === 'TEAM'
                      ? 'bg-[#eab308] text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Team
                </button>
                <button
                  type="button"
                  onClick={() => setChatTab('FIRMA')}
                  className={`py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                    chatTab === 'FIRMA'
                      ? 'bg-[#eab308] text-slate-950 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Firma
                </button>
              </div>

              <div className="h-40 overflow-y-auto space-y-2 pr-1 border border-slate-100 rounded-xl p-2.5 mb-2.5 bg-slate-50/50 text-xs">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                      <span className="font-bold text-slate-700">{msg.sender}</span>
                      <span>{msg.time}</span>
                    </div>
                    <div
                      className={`p-2 rounded-xl text-slate-800 ${
                        msg.isSystem ? 'bg-amber-50 border border-amber-200/80 text-amber-900' : 'bg-white border border-slate-200/70 shadow-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nachricht schreiben..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white p-2 rounded-xl transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Floating Bottom-Right Buttons */}
        <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => showToast('Yardım Rehberi açıldı.')}
            className="bg-[#1a2d52] hover:bg-[#223966] text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Rehber</span>
          </button>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-[#16a34a] hover:bg-[#15803d] text-white w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition active:scale-95 cursor-pointer"
            title="Form başına dön"
          >
            <UserPlus className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => showToast('Keine neuen Benachrichtigungen.')}
            className="bg-slate-900 hover:bg-slate-800 text-white w-11 h-11 rounded-full shadow-lg flex items-center justify-center transition active:scale-95 cursor-pointer"
            title="Benachrichtigungen"
          >
            <Bell className="w-5 h-5 text-slate-200" />
          </button>
        </div>
      </div>
    </AppShell>
  );
}
