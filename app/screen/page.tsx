'use client';

import { useEffect, useState, useRef } from 'react';
import { subscribeSubmissions } from '@/lib/firebase';
import type { Submission } from '@/lib/types';

const SESSION_ID = process.env.NEXT_PUBLIC_SESSION_ID ?? 'mschools-2026';

const EIXOS = [
  { value: 'Benestar social', emoji: '🤝', color: '#0d9488', bg: '#f0fdfb' },
  { value: 'Educació mediàtica', emoji: '📱', color: '#7c3aed', bg: '#f5f3ff' },
  { value: 'Consciència social', emoji: '🌍', color: '#ea580c', bg: '#fff7ed' },
  { value: 'Art i creativitat', emoji: '🎨', color: '#2563eb', bg: '#eff6ff' },
  { value: 'Equitat i inclusió', emoji: '🌈', color: '#be185d', bg: '#fdf2f8' },
  { value: 'Cultura i diversitat', emoji: '🏛️', color: '#16a34a', bg: '#f0fdf4' },
];

function useTimer(defaultMinutes: number) {
  const [inputMinutes, setInputMinutes] = useState(defaultMinutes);
  const [secondsLeft, setSecondsLeft] = useState(defaultMinutes * 60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startStop = () => {
    if (running) {
      clearInterval(intervalRef.current!);
      setRunning(false);
    } else {
      if (secondsLeft === 0) { setSecondsLeft(inputMinutes * 60); setFinished(false); }
      setRunning(true);
    }
  };

  const reset = () => {
    clearInterval(intervalRef.current!);
    setRunning(false);
    setFinished(false);
    setSecondsLeft(inputMinutes * 60);
  };

  const changeMinutes = (v: number) => {
    setInputMinutes(v);
    if (!running) setSecondsLeft(v * 60);
    setFinished(false);
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

  return { inputMinutes, secondsLeft, running, finished, startStop, reset, changeMinutes };
}

export default function ScreenPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [latestId, setLatestId] = useState<string | null>(null);

  const workshop = useTimer(15);
  const fase = useTimer(5);

  useEffect(() => {
    const unsub = subscribeSubmissions(SESSION_ID, (subs) => {
      setSubmissions(prev => {
        if (subs.length > prev.length && subs.length > 0) {
          setLatestId(subs[0].id);
          setShowNew(true);
          setTimeout(() => setShowNew(false), 4000);
        }
        return subs;
      });
    }, true);
    return () => unsub();
  }, []);

  const cols =
    submissions.length <= 2 ? 'grid-cols-2' :
    submissions.length <= 6 ? 'grid-cols-3' :
    'grid-cols-4';

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="px-8 py-5">
          <div className="flex items-start justify-between gap-8">

            {/* Left: title + live */}
            <div className="flex flex-col justify-between gap-1 min-w-fit">
              <h1 className="text-xl font-black leading-none" style={{ color: 'var(--heading)' }}>
                Vibe Coding · Pantalla
              </h1>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>mSchools 2026</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
                <span className="text-xs font-mono font-medium" style={{ color: 'var(--muted)' }}>
                  LIVE · {submissions.length} recurs{submissions.length !== 1 ? 'os' : ''}
                </span>
              </div>
            </div>

            {/* Timers */}
            <div className="flex items-stretch gap-6">
              <TimerBlock
                label="⏱ Workshop"
                sublabel="Total"
                {...workshop}
              />
              <div className="w-px" style={{ background: 'var(--border)' }} />
              <TimerBlock
                label="🏃 Fase"
                sublabel="Actual"
                {...fase}
              />
            </div>
          </div>

          {/* Eix counts */}
          {submissions.length > 0 && (
            <div className="mt-4 flex gap-2 flex-wrap">
              {EIXOS.map(e => {
                const count = submissions.filter(s => s.contextTheme === e.value || s.contextThemeLabel === e.value).length;
                if (count === 0) return null;
                return (
                  <span key={e.value} className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{ background: e.bg, color: e.color, border: `1px solid ${e.color}30` }}>
                    {e.emoji} {e.value} · {count}
                  </span>
                );
              })}
              {(() => {
                const other = submissions.filter(s => !EIXOS.some(e => e.value === s.contextTheme || e.value === s.contextThemeLabel)).length;
                return other > 0 ? (
                  <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                    style={{ background: '#f7f4f7', color: 'var(--muted)', border: '1px solid var(--border)' }}>
                    🎤 Veu · {other}
                  </span>
                ) : null;
              })()}
            </div>
          )}
        </div>
      </header>

      {/* New submission toast */}
      {showNew && (
        <div className="fixed top-6 right-6 z-50 rounded-2xl p-4 max-w-xs shadow-lg"
          style={{ background: '#f7f4f7', border: '1.5px solid var(--border)' }}>
          <div className="text-xs font-bold mb-1" style={{ color: 'var(--accent)' }}>✨ Nou recurs!</div>
          <div className="text-sm font-medium" style={{ color: 'var(--heading)' }}>
            {submissions[0]?.formatLabel}
          </div>
          {submissions[0]?.pairName && (
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{submissions[0].pairName}</div>
          )}
        </div>
      )}

      {/* Empty state */}
      {submissions.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-32">
          <div className="text-6xl">✨</div>
          <p className="text-xl font-bold" style={{ color: 'var(--heading)' }}>Esperant els primers recursos...</p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Els recursos apareixeran aquí en temps real</p>
        </div>
      )}

      {/* Grid */}
      {submissions.length > 0 && (
        <div className="flex-1 p-6">
          <div className={`grid gap-5 ${cols}`}>
            {submissions.map(s => (
              <ScreenCard key={s.id} submission={s} isNew={s.id === latestId && showNew} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}

interface TimerBlockProps {
  label: string;
  sublabel: string;
  inputMinutes: number;
  secondsLeft: number;
  running: boolean;
  finished: boolean;
  startStop: () => void;
  reset: () => void;
  changeMinutes: (v: number) => void;
}

function TimerBlock({ label, sublabel, inputMinutes, secondsLeft, running, finished, startStop, reset, changeMinutes }: TimerBlockProps) {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const pct = secondsLeft / (inputMinutes * 60);
  const urgent = secondsLeft <= 60 && secondsLeft > 0;

  const color = finished ? 'var(--accent)' : urgent ? '#ea580c' : 'var(--heading)';
  const bgColor = finished ? '#fef2f2' : urgent ? '#fff7ed' : '#f7f4f7';
  const borderColor = finished ? 'var(--accent)' : urgent ? '#ea580c50' : 'var(--border)';

  return (
    <div className="flex flex-col items-center gap-2 min-w-[160px]">
      <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
        {label}
      </div>

      {/* Big time display */}
      <div
        className="relative w-full flex items-center justify-center rounded-2xl px-4 py-3 font-mono font-black tabular-nums"
        style={{ fontSize: '3.5rem', lineHeight: 1, background: bgColor, border: `2px solid ${borderColor}`, color, minWidth: '160px' }}
      >
        {finished ? (
          <span style={{ fontSize: '2rem' }}>⏰ 0:00</span>
        ) : (
          `${mins}:${String(secs).padStart(2, '0')}`
        )}
        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 h-1.5 rounded-b-2xl transition-all duration-1000"
          style={{ width: `${pct * 100}%`, background: color, opacity: 0.35 }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          min={1} max={99}
          value={inputMinutes}
          onChange={e => changeMinutes(Math.max(1, Math.min(99, Number(e.target.value))))}
          disabled={running}
          className="w-12 rounded-lg px-1.5 py-1 text-sm text-center font-bold focus:outline-none"
          style={{ border: '1.5px solid var(--border)', background: running ? '#f0eaf0' : 'white', color: 'var(--heading)' }}
        />
        <span className="text-xs" style={{ color: 'var(--muted)' }}>min</span>
        <button
          onClick={startStop}
          className="rounded-lg px-3 py-1.5 text-sm font-bold transition-all"
          style={running
            ? { background: '#fff7ed', color: '#ea580c', border: '1.5px solid #ea580c50' }
            : { background: 'var(--heading)', color: 'white' }
          }
        >
          {running ? '⏸ Pausa' : secondsLeft === 0 ? '↺ Reinicia' : '▶ Iniciar'}
        </button>
        <button
          onClick={reset}
          className="rounded-lg px-2 py-1.5 text-sm transition-all"
          style={{ color: 'var(--muted)', border: '1.5px solid var(--border)', background: '#f7f4f7' }}
        >↺</button>
      </div>

      <div className="text-xs" style={{ color: 'var(--muted)' }}>{sublabel}</div>
    </div>
  );
}

function ScreenCard({ submission: s, isNew }: { submission: Submission; isNew: boolean }) {
  const eix = EIXOS.find(e => e.value === s.contextTheme || e.value === s.contextThemeLabel);

  return (
    <a
      href={`/app/${s.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col rounded-2xl overflow-hidden transition-all hover:scale-[1.02]"
      style={{
        border: isNew ? `2px solid var(--accent)` : '1.5px solid var(--border)',
        background: 'var(--bg)',
        boxShadow: isNew ? '0 0 24px rgba(230,57,70,0.12)' : undefined,
      }}
    >
      <div className="relative overflow-hidden" style={{ height: '200px', background: '#f7f4f7' }}>
        <iframe
          srcDoc={s.htmlOutput}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: 'scale(0.4)', transformOrigin: 'top left', width: '250%', height: '250%' }}
          sandbox="allow-scripts"
          title={s.formatLabel}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 60%, #f7f4f7)' }} />
        {eix && (
          <div className="absolute top-2 left-2 rounded-full px-2.5 py-1 text-xs font-bold"
            style={{ background: eix.bg, color: eix.color, border: `1px solid ${eix.color}30` }}>
            {eix.emoji} {eix.value}
          </div>
        )}
        {isNew && (
          <div className="absolute top-2 right-2 rounded-full px-2.5 py-1 text-xs font-bold text-white"
            style={{ background: 'var(--accent)' }}>
            NOU ✨
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-1.5">
        <div className="font-bold text-sm truncate" style={{ color: 'var(--heading)' }}>
          {s.formatLabel || 'Recurs educatiu'}
        </div>
        <p className="text-xs line-clamp-2" style={{ color: 'var(--muted)' }}>{s.tasca}</p>
        {s.pairName && (
          <div className="mt-1 text-xs font-bold" style={{ color: 'var(--accent)' }}>{s.pairName}</div>
        )}
      </div>
    </a>
  );
}
