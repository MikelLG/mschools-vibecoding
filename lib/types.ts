export interface WorkshopTimer {
  phase: number;           // 0 = not started, 1/2/3 = active phase
  phaseLabel: string;
  instruction: string;
  color: string;
  bg: string;
  durationSeconds: number;
  startedAt: number;       // ms timestamp of when current run segment started
  secondsAtStart: number;  // seconds remaining when start/resume was pressed
  running: boolean;
}

export interface PrintQueueItem {
  id: string;
  submissionId: string;
  sessionId: string;
  pairName: string;
  tasca: string;
  formatLabel?: string;
  appUrl: string;
  createdAt: number;
  status: 'pending' | 'printing' | 'printed' | 'error';
  retryCount: number;
  printedAt?: number;
  refinements?: string[];
}

export interface Submission {
  id: string;
  stationId: number;
  pairName?: string;
  rol: string;
  rolLabel: string;
  contextTheme: string;
  contextThemeLabel: string;
  contextDescription: string;
  tasca: string;
  format: string;
  formatLabel: string;
  prompt: string;
  htmlOutput: string;
  refinements?: string[];
  createdAt: number;
  sessionId: string;
}

export type Step = 'rol' | 'context' | 'tasca' | 'format' | 'generating';

export const ROL_OPTIONS = [
  { value: 'tutor', label: 'Tutor/a de classe', emoji: '👩‍🏫' },
  { value: 'primaria', label: 'Mestre/a de primària', emoji: '📚' },
  { value: 'eso', label: 'Professor/a ESO/Batxillerat', emoji: '🎓' },
  { value: 'coordinador', label: 'Coordinador/a pedagògic/a', emoji: '🗂️' },
  { value: 'especialista', label: 'Especialista (PT, AL…)', emoji: '🔬' },
  { value: 'directiu', label: 'Equip directiu', emoji: '🏫' },
] as const;

export const CONTEXT_THEMES = [
  { value: 'families', label: 'Comunicació amb famílies', emoji: '📱', color: '#6366f1' },
  { value: 'aula', label: 'Gestió d\'aula', emoji: '🏫', color: '#0ea5e9' },
  { value: 'inclusio', label: 'Inclusió i diversitat', emoji: '🌈', color: '#10b981' },
  { value: 'avaluacio', label: 'Avaluació i feedback', emoji: '📊', color: '#f59e0b' },
  { value: 'benestar', label: 'Benestar emocional', emoji: '💙', color: '#ec4899' },
  { value: 'organitzacio', label: 'Organització del centre', emoji: '📋', color: '#8b5cf6' },
] as const;

export const FORMAT_OPTIONS = [
  { value: 'quiz', label: 'Quiz interactiu', emoji: '🎯', description: 'Preguntes amb resposta i feedback automàtic' },
  { value: 'activitat', label: 'Activitat per a l\'aula', emoji: '📚', description: 'Fitxa o exercici interactiu per als alumnes' },
  { value: 'rubrica', label: 'Rúbrica d\'avaluació', emoji: '✅', description: 'Criteris d\'avaluació amb puntuació' },
  { value: 'formulari', label: 'Formulari per a famílies', emoji: '📝', description: 'Comunicat o enquesta per als pares' },
  { value: 'joc', label: 'Joc educatiu', emoji: '🎮', description: 'Dinàmica lúdica amb objectiu pedagògic' },
  { value: 'suport', label: 'Material de suport', emoji: '🔧', description: 'Recurs visual o guia pràctica' },
] as const;
