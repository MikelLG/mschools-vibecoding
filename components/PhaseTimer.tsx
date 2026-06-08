'use client';

import { useState, useEffect, useRef } from 'react';

interface PhaseTimerProps {
  phase: number;
  label: string;
  defaultMinutes: number;
  instruction: string;
  color?: string;
  bg?: string;
}

export function PhaseTimer({
  phase,
  label,
  defaultMinutes,
  instruction,
  color = '#ea580c',
  bg = '#fff7ed',
}: PhaseTimerProps) {
  const total = defaultMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(total);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pct = secondsLeft / total;
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const urgent = running && secondsLeft <= 60 && secondsLeft > 0;

  const timerColor = finished ? '#dc2626' : urgent ? '#ea580c' : color;

  const startStop = () => {
    if (running) {
      clearInterval(intervalRef.current!);
      setRunning(false);
    } else {
      if (secondsLeft === 0) { setSecondsLeft(total); setFinished(false); }
      setRunning(true);
    }
  };

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setFinished(true);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current!);
  }, [running]);

  return (
    <div className="relative" style={{ background: bg, borderBottom: `1px solid ${color}25` }}>
      <div className="max-w-3xl mx-auto px-6 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span
            className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white"
            style={{ background: timerColor }}
          >
            {phase}
          </span>
          <span className="text-xs font-bold" style={{ color: timerColor }}>{label}</span>
          <span className="text-xs hidden sm:inline truncate" style={{ color: timerColor, opacity: 0.75 }}>
            · {instruction}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="font-mono font-black text-base tabular-nums"
            style={{ color: timerColor }}
          >
            {finished ? '⏰ 0:00' : `${mins}:${String(secs).padStart(2, '0')}`}
          </span>
          <button
            onClick={startStop}
            className="rounded-lg px-2.5 py-1 text-xs font-bold transition-all"
            style={
              running
                ? { background: `${timerColor}20`, color: timerColor }
                : { background: timerColor, color: 'white' }
            }
          >
            {running ? '⏸' : secondsLeft === 0 ? '↺' : '▶'}
          </button>
        </div>
      </div>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `${color}15` }}>
        <div
          className="h-full transition-all duration-1000"
          style={{ width: `${pct * 100}%`, background: timerColor, opacity: 0.45 }}
        />
      </div>
    </div>
  );
}
