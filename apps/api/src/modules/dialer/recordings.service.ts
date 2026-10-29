import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../common/services/database.service.js';

export interface CallRecordingDto {
  id: string;
  callId: string;
  customerName: string;
  calleeNumber: string;
  agentName: string;
  projectName: string;
  durationSeconds: number;
  durationFormatted: string;
  channelsCount: number;
  recordedAt: string;
  audioUrl: string;
  qualityScore: number;
  diarizedTranscript: Array<{
    speaker: 'AGENT' | 'CUSTOMER';
    text: string;
    timestamp: string;
  }>;
}

const memoryRecordings: CallRecordingDto[] = [
  {
    id: 'rec-0001',
    callId: 'call-0001',
    customerName: 'Maximilian Weber',
    calleeNumber: '+491714567890',
    agentName: 'Umut Kaya',
    projectName: 'Photovoltaik',
    durationSeconds: 145,
    durationFormatted: '02:25',
    channelsCount: 2,
    recordedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    audioUrl: '/mock-audio/demo-pv-call.mp3',
    qualityScore: 92,
    diarizedTranscript: [
      { speaker: 'AGENT', text: 'Guten Tag Herr Weber, mein Name ist Umut Kaya von der Solarenergie-Beratung.', timestamp: '00:03' },
      { speaker: 'CUSTOMER', text: 'Guten Tag, ja ich hatte online eine Anfrage wegen einer Solaranlage gestellt.', timestamp: '00:08' },
      { speaker: 'AGENT', text: 'Genau! Ich sehe, Sie besitzen ein Einfamilienhaus mit Satteldach in München. Wie hoch ist Ihr Jahresstromverbrauch?', timestamp: '00:15' },
      { speaker: 'CUSTOMER', text: 'Wir verbrauchen circa 5.200 kWh im Jahr und hätten gerne auch einen Speicher dazu.', timestamp: '00:22' },
      { speaker: 'AGENT', text: 'Hervorragend. Ich trage die Daten direkt in Ihren Fragebogen ein.', timestamp: '00:30' },
    ],
  },
  {
    id: 'rec-0002',
    callId: 'call-0002',
    customerName: 'Claudia Fischer',
    calleeNumber: '+49407654321',
    agentName: 'Erensamsun Aydin',
    projectName: 'Wärmepumpe',
    durationSeconds: 98,
    durationFormatted: '01:38',
    channelsCount: 2,
    recordedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    audioUrl: '/mock-audio/demo-wp-call.mp3',
    qualityScore: 88,
    diarizedTranscript: [
      { speaker: 'AGENT', text: 'Schönen guten Tag Frau Fischer! Ich rufe an bezüglich Ihrer Wärmepumpen-Anfrage.', timestamp: '00:02' },
      { speaker: 'CUSTOMER', text: 'Hallo! Wir heizen aktuell noch mit Gas, Baujahr 1998.', timestamp: '00:07' },
      { speaker: 'AGENT', text: 'Perfekt, für Bestandsbauten aus diesem Jahr gibt es aktuell attraktive Förderungen bis zu 70%.', timestamp: '00:14' },
    ],
  },
];

@Injectable()
export class RecordingsService {
  constructor(private readonly db: DatabaseService) {}

  async listRecordings(tenantId: string): Promise<CallRecordingDto[]> {
    return memoryRecordings;
  }

  async getRecording(tenantId: string, id: string): Promise<CallRecordingDto | null> {
    return memoryRecordings.find((r) => r.id === id) || null;
  }
}
