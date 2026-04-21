export type Language = 'Chinese' | 'Korean' | 'Japanese' | 'Russian' | 'Turkish';

export interface DialogueEntry {
  id: string;
  speaker: string;
  text: string;
  translation: string;
  pronunciation?: string;
  side: 'left' | 'right';
}

export interface VocabularyEntry {
  id: string;
  word: string;
  translation: string;
  pronunciation?: string;
}

export type DisplayMode = 'chat' | 'comic' | 'vocab' | 'quiz';

export const LANGUAGES: { label: string; value: Language; code: string }[] = [
  { label: 'Chinese (中文)', value: 'Chinese', code: 'zh' },
  { label: 'Korean (한국어)', value: 'Korean', code: 'ko' },
  { label: 'Japanese (日本語)', value: 'Japanese', code: 'ja' },
  { label: 'Russian (Русский)', value: 'Russian', code: 'ru' },
  { label: 'Turkish (Türkçe)', value: 'Turkish', code: 'tr' },
];
