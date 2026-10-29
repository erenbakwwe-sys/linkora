import { ConversationTurn } from './llm-provider.js';

export interface SttTranscriptResult {
  language: 'de' | 'tr' | 'mixed';
  confidence: number;
  durationSeconds: number;
  turns: ConversationTurn[];
}

export interface SttProvider {
  readonly id: string;
  readonly name: string;
  transcribe(audioBufferOrUrl: Buffer | string, options?: { languageHint?: 'de' | 'tr' }): Promise<SttTranscriptResult>;
}
