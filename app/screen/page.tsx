'use client';

import { useEffect, useState, useRef } from 'react';
import { subscribeSubmissions, subscribeWorkshopTimer, updateWorkshopTimer, DEFAULT_TIMER, subscribePrintQueue, updatePrintQueueItem } from '@/lib/firebase';
import type { Submission, WorkshopTimer, PrintQueueItem } from '@/lib/types';
import { WORKSHOP_PHASES, getSecondsLeft } from '@/lib/workshop-phases';
import { MSchoolsLogo } from '@/components/MSchoolsLogo';

const SESSION_ID = process.env.NEXT_PUBLIC_SESSION_ID ?? 'mschools-2026';
const FACILITATOR_PASSWORD = process.env.NEXT_PUBLIC_FACILITATOR_PASSWORD ?? 'mschools2026';
const AUTH_KEY = 'facilitator_auth';

function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === FACILITATOR_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, '1');
      onAuth();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#fff' }}>
      <form onSubmit={handleSubmit} className="bg-white w-full flex flex-col"
        style={{ maxWidth: 380, border: '1.5px solid #c9a0b0', borderRadius: 12, padding: '48px 36px 44px', gap: 20 }}>

        {/* Logo */}
        <div className="flex justify-center" style={{ marginBottom: 8 }}>
          <img src="/mschools-ia-lab.png" alt="mSchools IA Lab" style={{ height: 44, width: 'auto' }} />
        </div>

        <h1 className="text-center font-black" style={{ fontSize: 26, color: '#5e2440', marginBottom: 4 }}>Vibe Coding</h1>

        <div className="flex flex-col" style={{ gap: 6 }}>
          <label className="text-sm font-semibold" style={{ color: '#9e6070' }}>Contrasenya</label>
          <input
            type="password"
            value={password}
            onChange={e => { setPassword(e.target.value); setError(false); }}
            autoFocus
            className="rounded-lg px-4 text-sm focus:outline-none"
            style={{
              height: 52,
              border: error ? '1.5px solid #dc2626' : '1.5px solid #c4cadc',
              background: '#eef1f8',
            }}
          />
          {error && <p className="text-xs mt-1" style={{ color: '#dc2626' }}>Contrasenya incorrecta</p>}
        </div>

        <button type="submit"
          className="w-full rounded-lg font-bold text-white text-base transition-all hover:opacity-90"
          style={{ height: 52, background: '#5cb87a', marginTop: 4 }}>
          Entrar
        </button>
      </form>
    </div>
  );
}

const EIXOS = [
  { value: 'Benestar social', emoji: '🤝', color: '#0d9488', bg: '#f0fdfb' },
  { value: 'Educació mediàtica', emoji: '📱', color: '#7c3aed', bg: '#f5f3ff' },
  { value: 'Consciència social', emoji: '🌍', color: '#ea580c', bg: '#fff7ed' },
  { value: 'Art i creativitat', emoji: '🎨', color: '#2563eb', bg: '#eff6ff' },
  { value: 'Equitat i inclusió', emoji: '🌈', color: '#be185d', bg: '#fdf2f8' },
  { value: 'Cultura i diversitat', emoji: '🏛️', color: '#16a34a', bg: '#f0fdf4' },
];

// ── Local workshop-total timer ─────────────────────────────────────────────────
function useLocalTimer(defaultMinutes: number) {
  const [inputMinutes, setInputMinutes] = useState(defaultMinutes);
  const [secondsLeft, setSecondsLeft] = useState(defaultMinutes * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startStop = () => {
    if (running) { clearInterval(intervalRef.current!); setRunning(false); }
    else {
      if (secondsLeft === 0) setSecondsLeft(inputMinutes * 60);
      setRunning(true);
    }
  };
  const reset = () => {
    clearInterval(intervalRef.current!);
    setRunning(false);
    setSecondsLeft(inputMinutes * 60);
  };
  const changeMinutes = (v: number) => {
    setInputMinutes(v);
    if (!running) setSecondsLeft(v * 60);
  };

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) { clearInterval(intervalRef.current!); setRunning(false); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [running]);

  return { inputMinutes, secondsLeft, running, startStop, reset, changeMinutes };
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function ScreenPage() {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(AUTH_KEY) === '1') setAuthed(true);
  }, []);

  if (!authed) return <LoginGate onAuth={() => setAuthed(true)} />;

  return <ScreenContent />;
}

function ScreenContent() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [latestId, setLatestId] = useState<string | null>(null);

  // Firestore-backed phase timer
  const [timer, setTimer] = useState<WorkshopTimer>(DEFAULT_TIMER);
  const [localSeconds, setLocalSeconds] = useState(300);
  const [selectedPhase, setSelectedPhase] = useState(1);
  const [customMinutes, setCustomMinutes] = useState<Record<number, number>>({
    1: WORKSHOP_PHASES[0].defaultMinutes,
    2: WORKSHOP_PHASES[1].defaultMinutes,
    3: WORKSHOP_PHASES[2].defaultMinutes,
  });
  const [saving, setSaving] = useState(false);

  // Local workshop-total timer
  const workshop = useLocalTimer(15);

  // Subscribe to Firestore timer
  useEffect(() => {
    const unsub = subscribeWorkshopTimer(t => {
      setTimer(t);
      if (t.phase > 0) setSelectedPhase(t.phase);
    });
    return () => unsub();
  }, []);

  // Recalculate localSeconds every 500ms from Firestore state
  useEffect(() => {
    const tick = () => setLocalSeconds(Math.max(0, Math.floor(getSecondsLeft(timer))));
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [timer]);

  // Print queue
  const [printQueue, setPrintQueue] = useState<PrintQueueItem[]>([]);
  const [autoPrint, setAutoPrint] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('autoPrint') !== 'off';
    return true;
  });
  const [printTab, setPrintTab] = useState<'cua' | 'historial'>('cua');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const printingRef = useRef<Set<string>>(new Set());

  const openPrintWindow = (queueId: string) => {
    window.open(`/print/${queueId}`, `print_${queueId}`, 'width=480,height=700,popup=1');
  };

  useEffect(() => {
    const unsub = subscribePrintQueue(SESSION_ID, items => {
      setPrintQueue(items);
    });
    return () => unsub();
  }, []);

  // Auto-print: fire for each new pending item
  useEffect(() => {
    if (!autoPrint) return;
    const pending = printQueue.filter(i => i.status === 'pending' && !printingRef.current.has(i.id));
    for (const item of pending) {
      printingRef.current.add(item.id);
      openPrintWindow(item.id);
    }
  }, [printQueue, autoPrint]);

  const toggleAutoPrint = (val: boolean) => {
    setAutoPrint(val);
    localStorage.setItem('autoPrint', val ? 'on' : 'off');
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const reprintSelected = () => {
    for (const id of selectedIds) openPrintWindow(id);
    setSelectedIds(new Set());
  };

  const pendingCount = printQueue.filter(i => i.status === 'pending' || i.status === 'printing').length;
  const errorCount = printQueue.filter(i => i.status === 'error').length;

  // Auto-advance phases
  const [autoAdvance, setAutoAdvance] = useState(true);
  const prevSecondsRef = useRef(-1);
  const advancingRef = useRef(false);

  useEffect(() => {
    const prev = prevSecondsRef.current;
    prevSecondsRef.current = localSeconds;
    if (prev > 0 && localSeconds === 0 && timer.running && !advancingRef.current && autoAdvance && timer.phase > 0) {
      const currentIndex = WORKSHOP_PHASES.findIndex(p => p.id === timer.phase);
      const nextPhase = WORKSHOP_PHASES[currentIndex + 1];
      if (nextPhase) {
        advancingRef.current = true;
        const duration = (customMinutes[nextPhase.id] ?? nextPhase.defaultMinutes) * 60;
        setTimeout(async () => {
          setSelectedPhase(nextPhase.id);
          await updateWorkshopTimer({
            phase: nextPhase.id, phaseLabel: nextPhase.label, instruction: nextPhase.instruction,
            color: nextPhase.color, bg: nextPhase.bg,
            durationSeconds: duration, startedAt: Date.now(), secondsAtStart: duration, running: true,
          });
          advancingRef.current = false;
        }, 1500);
      }
    }
  }, [localSeconds, timer.running, timer.phase, autoAdvance, customMinutes]);

  const handleWorkshopStart = () => {
    if (!workshop.running) {
      // Starting workshop — also kick off Phase 1
      const phase1 = WORKSHOP_PHASES[0];
      const duration = (customMinutes[phase1.id] ?? phase1.defaultMinutes) * 60;
      updateWorkshopTimer({
        phase: phase1.id, phaseLabel: phase1.label, instruction: phase1.instruction,
        color: phase1.color, bg: phase1.bg,
        durationSeconds: duration, startedAt: Date.now(), secondsAtStart: duration, running: true,
      });
      setSelectedPhase(phase1.id);
    }
    workshop.startStop();
  };

  // Subscribe to submissions
  useEffect(() => {
    const unsub = subscribeSubmissions(SESSION_ID, subs => {
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

  // ── Timer actions ────────────────────────────────────────────────────────────

  const run = async (updates: Partial<WorkshopTimer>) => {
    setSaving(true);
    try { await updateWorkshopTimer(updates); }
    finally { setSaving(false); }
  };

  const handleStartPhase = async () => {
    const phase = WORKSHOP_PHASES.find(p => p.id === selectedPhase)!;
    const durationSeconds = (customMinutes[selectedPhase] ?? phase.defaultMinutes) * 60;
    await run({
      phase: phase.id,
      phaseLabel: phase.label,
      instruction: phase.instruction,
      color: phase.color,
      bg: phase.bg,
      durationSeconds,
      startedAt: Date.now(),
      secondsAtStart: durationSeconds,
      running: true,
    });
  };

  const handlePause = async () => {
    await run({ running: false, secondsAtStart: Math.max(0, Math.floor(getSecondsLeft(timer))) });
  };

  const handleResume = async () => {
    await run({ running: true, startedAt: Date.now() });
  };

  const handleReset = async () => {
    const durationSeconds = (customMinutes[timer.phase] ?? WORKSHOP_PHASES.find(p => p.id === timer.phase)?.defaultMinutes ?? 5) * 60;
    await run({ running: false, startedAt: 0, secondsAtStart: durationSeconds });
  };

  // ── Display helpers ──────────────────────────────────────────────────────────

  const displayMins = Math.floor(localSeconds / 60);
  const displaySecs = localSeconds % 60;
  const pct = timer.durationSeconds > 0 ? localSeconds / timer.durationSeconds : 1;
  const urgent = localSeconds <= 60 && localSeconds > 0 && timer.running;
  const finished = timer.phase > 0 && localSeconds === 0 && timer.startedAt > 0 && !timer.running;
  const notStarted = timer.phase === 0;

  const timerColor = finished ? '#dc2626' : urgent ? '#ea580c' : (timer.color || 'var(--heading)');
  const timerBg = finished ? '#fef2f2' : urgent ? '#fff7ed' : (timer.bg || '#f7f4f7');

  const wMins = Math.floor(workshop.secondsLeft / 60);
  const wSecs = workshop.secondsLeft % 60;

  const cols =
    submissions.length <= 2 ? 'grid-cols-2' :
    submissions.length <= 6 ? 'grid-cols-3' : 'grid-cols-4';

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-white border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="px-6 pt-4 pb-3">

          {/* Top row: title + workshop total + live */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-black leading-none" style={{ color: 'var(--heading)' }}>
                IA Lab · Pantalla
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
                <span className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
                  LIVE · {submissions.length} recurs{submissions.length !== 1 ? 'os' : ''}
                </span>
              </div>
            </div>

            {/* Workshop total — local, facilitator's reference */}
            <div className="flex items-center gap-2 rounded-xl px-4 py-2" style={{ background: '#f7f4f7', border: '1px solid var(--border)' }}>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>⏱ Workshop</span>
              <span className="font-mono font-black text-xl tabular-nums" style={{ color: workshop.secondsLeft <= 60 && workshop.running ? '#ea580c' : 'var(--heading)' }}>
                {wMins}:{String(wSecs).padStart(2, '0')}
              </span>
              <input
                type="number" min={1} max={99} value={workshop.inputMinutes}
                onChange={e => workshop.changeMinutes(Math.max(1, Math.min(99, Number(e.target.value))))}
                disabled={workshop.running}
                className="w-10 rounded-lg px-1 py-0.5 text-xs text-center font-bold focus:outline-none"
                style={{ border: '1px solid var(--border)', background: workshop.running ? '#f0eaf0' : 'white', color: 'var(--heading)' }}
              />
              <span className="text-xs" style={{ color: 'var(--muted)' }}>min</span>
              <button
                onClick={handleWorkshopStart}
                className="rounded-lg px-2.5 py-1 text-xs font-bold"
                style={workshop.running ? { background: '#fff7ed', color: '#ea580c' } : { background: 'var(--heading)', color: 'white' }}
              >
                {workshop.running ? '⏸' : '▶'}
              </button>
              <button onClick={workshop.reset} className="rounded-lg px-2 py-1 text-xs" style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}>↺</button>
              {/* Auto-advance toggle */}
              <div className="flex items-center gap-1.5 ml-1 pl-3" style={{ borderLeft: '1px solid var(--border)' }}>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>Auto</span>
                <button onClick={() => setAutoAdvance(v => !v)}
                  className="w-9 h-5 rounded-full transition-all relative flex-shrink-0"
                  style={{ background: autoAdvance ? '#00e082' : '#d1c5d0' }}>
                  <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all"
                    style={{ left: autoAdvance ? '1.125rem' : '0.125rem' }} />
                </button>
              </div>
            </div>
          </div>

          {/* Phase selector */}
          <div className="flex gap-2 mb-4">
            {WORKSHOP_PHASES.map(p => {
              const isActive = timer.phase === p.id;
              const isSelected = selectedPhase === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPhase(p.id)}
                  className="flex-1 rounded-xl px-3 py-2.5 text-sm font-bold transition-all"
                  style={isActive
                    ? { background: p.color, color: 'white' }
                    : isSelected
                    ? { background: p.bg, color: p.color, border: `2px solid ${p.color}` }
                    : { background: '#f7f4f7', color: 'var(--muted)', border: '1.5px solid var(--border)' }
                  }
                >
                  <span className="mr-1">{p.id}</span>
                  {p.label}
                  {isActive && timer.running && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </button>
              );
            })}
          </div>

          {/* Big phase timer */}
          <div className="relative rounded-2xl overflow-hidden mb-3"
            style={{ background: timerBg, border: `2px solid ${timerColor}30` }}>

            <div className="px-6 py-4 flex items-center justify-between gap-6">
              {/* Time */}
              <div className="flex flex-col">
                <div
                  className="font-mono font-black tabular-nums leading-none"
                  style={{ fontSize: '5rem', color: timerColor }}
                >
                  {notStarted ? '--:--' : finished ? '0:00' : `${displayMins}:${String(displaySecs).padStart(2, '0')}`}
                </div>
                <div className="text-sm mt-1 font-medium" style={{ color: timerColor, opacity: 0.8 }}>
                  {notStarted
                    ? 'Selecciona una fase i prem Iniciar'
                    : `Fase ${timer.phase} · ${timer.phaseLabel}`
                  }
                </div>
                {timer.instruction && !notStarted && (
                  <div className="text-xs mt-0.5" style={{ color: timerColor, opacity: 0.65 }}>
                    {timer.instruction}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-3 flex-shrink-0">
                {/* Duration input */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold" style={{ color: timerColor, opacity: 0.7 }}>Durada:</span>
                  <input
                    type="number" min={1} max={60}
                    value={customMinutes[selectedPhase] ?? WORKSHOP_PHASES.find(p => p.id === selectedPhase)?.defaultMinutes ?? 5}
                    onChange={e => setCustomMinutes(prev => ({
                      ...prev,
                      [selectedPhase]: Math.max(1, Math.min(60, Number(e.target.value)))
                    }))}
                    disabled={timer.running && timer.phase === selectedPhase}
                    className="w-14 rounded-lg px-2 py-1.5 text-sm text-center font-black focus:outline-none"
                    style={{ border: `2px solid ${timerColor}40`, background: 'white', color: timerColor }}
                  />
                  <span className="text-sm font-bold" style={{ color: timerColor, opacity: 0.7 }}>min</span>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  {/* Start / Iniciar fase */}
                  {(!timer.running || timer.phase !== selectedPhase) && (
                    <button
                      onClick={handleStartPhase}
                      disabled={saving}
                      className="rounded-xl px-5 py-2.5 text-sm font-black transition-all"
                      style={{ background: WORKSHOP_PHASES.find(p => p.id === selectedPhase)?.color ?? 'var(--heading)', color: 'white' }}
                    >
                      {timer.phase === selectedPhase && !timer.running && timer.startedAt > 0
                        ? '↺ Reiniciar'
                        : `▶ Iniciar fase ${selectedPhase}`}
                    </button>
                  )}

                  {/* Pause / Resume — only when this phase is active */}
                  {timer.phase === selectedPhase && timer.startedAt > 0 && (
                    <>
                      {timer.running ? (
                        <button
                          onClick={handlePause}
                          disabled={saving}
                          className="rounded-xl px-5 py-2.5 text-sm font-black transition-all"
                          style={{ background: '#fff7ed', color: '#ea580c', border: '2px solid #ea580c50' }}
                        >
                          ⏸ Pausa
                        </button>
                      ) : (
                        <button
                          onClick={handleResume}
                          disabled={saving}
                          className="rounded-xl px-5 py-2.5 text-sm font-black transition-all"
                          style={{ background: timerColor, color: 'white' }}
                        >
                          ▶ Reprendre
                        </button>
                      )}
                      <button
                        onClick={handleReset}
                        disabled={saving}
                        className="rounded-xl px-3 py-2.5 text-sm font-bold transition-all"
                        style={{ color: 'var(--muted)', border: '1.5px solid var(--border)', background: 'white' }}
                      >
                        ↺
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2" style={{ background: `${timerColor}15` }}>
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${pct * 100}%`, background: timerColor, opacity: 0.5 }}
              />
            </div>
          </div>

          {/* Eix counts */}
          {submissions.length > 0 && (
            <div className="flex gap-2 flex-wrap">
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
          <div className="text-sm font-medium" style={{ color: 'var(--heading)' }}>{submissions[0]?.formatLabel}</div>
          {submissions[0]?.pairName && (
            <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{submissions[0].pairName}</div>
          )}
        </div>
      )}

      {/* Empty state */}
      {submissions.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-24">
          <div className="text-6xl">✨</div>
          <p className="text-xl font-bold" style={{ color: 'var(--heading)' }}>Esperant els primers recursos...</p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>Els recursos apareixeran aquí en temps real</p>
        </div>
      )}

      {/* Print queue panel */}
      {printQueue.length > 0 && (
        <div className="mx-6 mt-4 rounded-2xl overflow-hidden" style={{ border: '1.5px solid var(--border)', background: 'white' }}>
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'var(--border)', background: '#f7f4f7' }}>
            <div className="flex items-center gap-3">
              <span className="font-bold text-sm" style={{ color: 'var(--heading)' }}>🖨️ Impressora</span>
              {pendingCount > 0 && <span className="rounded-full px-2 py-0.5 text-xs font-black text-white" style={{ background: '#ea580c' }}>{pendingCount}</span>}
              {errorCount > 0 && <span className="rounded-full px-2 py-0.5 text-xs font-black text-white" style={{ background: '#dc2626' }}>⚠️ {errorCount} error{errorCount > 1 ? 's' : ''}</span>}
            </div>
            <div className="flex items-center gap-4">
              {selectedIds.size > 0 && (
                <button onClick={reprintSelected} className="text-xs font-bold px-3 py-1.5 rounded-lg"
                  style={{ background: 'var(--heading)', color: 'white' }}>
                  Reimprimir {selectedIds.size} seleccionats
                </button>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: 'var(--muted)' }}>Auto-impressió</span>
                <button onClick={() => toggleAutoPrint(!autoPrint)}
                  className="w-10 h-5 rounded-full transition-all relative"
                  style={{ background: autoPrint ? '#00e082' : '#d1c5d0' }}>
                  <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm"
                    style={{ left: autoPrint ? '1.25rem' : '0.125rem' }} />
                </button>
              </div>
              <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                {(['cua', 'historial'] as const).map(t => (
                  <button key={t} onClick={() => setPrintTab(t)}
                    className="px-3 py-1 text-xs font-bold capitalize transition-all"
                    style={printTab === t ? { background: 'var(--heading)', color: 'white' } : { color: 'var(--muted)' }}>
                    {t === 'cua' ? `Cua (${pendingCount})` : `Historial (${printQueue.length})`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Queue / History list */}
          <div className="max-h-48 overflow-y-auto">
            {(printTab === 'cua'
              ? printQueue.filter(i => i.status === 'pending' || i.status === 'printing')
              : printQueue
            ).map(item => {
              const statusColor = { pending: '#ea580c', printing: '#2563eb', printed: '#16a34a', error: '#dc2626' }[item.status];
              const statusLabel = { pending: '🟡 Pendent', printing: '🔵 Imprimint...', printed: '✓ Imprès', error: '❌ Error' }[item.status];
              return (
                <div key={item.id} className="flex items-center gap-3 px-5 py-2.5 border-b text-sm" style={{ borderColor: '#f0eaf0' }}>
                  <input type="checkbox" checked={selectedIds.has(item.id)} onChange={() => toggleSelect(item.id)}
                    className="rounded" />
                  <span className="font-bold flex-1" style={{ color: 'var(--heading)' }}>
                    {item.pairName || <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>Sense nom</span>}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--muted)' }}>
                    {new Date(item.createdAt).toLocaleTimeString('ca-ES', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-xs font-bold" style={{ color: statusColor }}>{statusLabel}</span>
                  <button onClick={() => openPrintWindow(item.id)}
                    className="text-xs px-2 py-1 rounded-lg font-bold transition-all"
                    style={{ background: '#f7f4f7', border: '1px solid var(--border)', color: 'var(--muted)' }}>
                    Reimprimir
                  </button>
                </div>
              );
            })}
            {printTab === 'cua' && pendingCount === 0 && (
              <div className="px-5 py-4 text-xs text-center" style={{ color: 'var(--muted)' }}>
                Cap tiquet pendent. Els nous tiquets apareixeran aquí automàticament.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gallery grid */}
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

function ScreenCard({ submission: s, isNew }: { submission: Submission; isNew: boolean }) {
  const eix = EIXOS.find(e => e.value === s.contextTheme || e.value === s.contextThemeLabel);
  return (
    <a href={`/app/${s.id}`} target="_blank" rel="noopener noreferrer"
      className="flex flex-col rounded-2xl overflow-hidden transition-all hover:scale-[1.02]"
      style={{
        border: isNew ? `2px solid var(--accent)` : '1.5px solid var(--border)',
        background: 'var(--bg)',
        boxShadow: isNew ? '0 0 24px rgba(230,57,70,0.12)' : undefined,
      }}>
      <div className="relative overflow-hidden" style={{ height: '200px', background: '#f7f4f7' }}>
        <iframe srcDoc={s.htmlOutput} className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: 'scale(0.4)', transformOrigin: 'top left', width: '250%', height: '250%' }}
          sandbox="allow-scripts" title={s.formatLabel} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 60%, #f7f4f7)' }} />
        {eix && (
          <div className="absolute top-2 left-2 rounded-full px-2.5 py-1 text-xs font-bold"
            style={{ background: eix.bg, color: eix.color, border: `1px solid ${eix.color}30` }}>
            {eix.emoji} {eix.value}
          </div>
        )}
        {isNew && (
          <div className="absolute top-2 right-2 rounded-full px-2.5 py-1 text-xs font-bold text-white"
            style={{ background: 'var(--accent)' }}>NOU ✨</div>
        )}
      </div>
      <div className="p-4 flex flex-col gap-1.5">
        <div className="font-bold text-sm truncate" style={{ color: 'var(--heading)' }}>
          {s.formatLabel || 'Recurs educatiu'}
        </div>
        <p className="text-xs line-clamp-2" style={{ color: 'var(--muted)' }}>{s.tasca}</p>
        {s.pairName && <div className="mt-1 text-xs font-bold" style={{ color: 'var(--accent)' }}>{s.pairName}</div>}
      </div>
    </a>
  );
}
