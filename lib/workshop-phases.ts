export interface Phase {
  id: number;
  label: string;
  instruction: string;
  defaultMinutes: number;
  color: string;
  bg: string;
}

export const WORKSHOP_PHASES: Phase[] = [
  {
    id: 1,
    label: 'Warm-up',
    instruction: "Explora l'app d'exemple i endevina el prompt que la va generar",
    defaultMinutes: 5,
    color: '#ea580c',
    bg: '#fff7ed',
  },
  {
    id: 2,
    label: 'Construeix el prompt',
    instruction: 'Selecciona les 5 targetes i descriu el teu repte educatiu',
    defaultMinutes: 8,
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    id: 3,
    label: 'Itera i millora',
    instruction: "Prova l'app, aplica millores i posa-li el nom al final",
    defaultMinutes: 5,
    color: '#0d9488',
    bg: '#f0fdfb',
  },
];

export function getSecondsLeft(timer: {
  running: boolean;
  startedAt: number;
  secondsAtStart: number;
}): number {
  if (!timer.running || timer.startedAt === 0) return timer.secondsAtStart;
  const elapsed = (Date.now() - timer.startedAt) / 1000;
  return Math.max(0, timer.secondsAtStart - elapsed);
}
