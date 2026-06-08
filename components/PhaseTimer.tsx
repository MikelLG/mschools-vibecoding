'use client';

import { useState, useEffect } from 'react';
import { subscribeWorkshopTimer, DEFAULT_TIMER } from '@/lib/firebase';
import { WORKSHOP_PHASES, getSecondsLeft } from '@/lib/workshop-phases';
import type { WorkshopTimer } from '@/lib/types';

interface PhaseTimerProps {
  pagePhase: number; // which phase this page belongs to (1/2/3)
}

export function PhaseTimer({ pagePhase }: PhaseTimerProps) {
  const [timer, setTimer] = useState<WorkshopTimer>(DEFAULT_TIMER);
  const [localSeconds, setLocalSeconds] = useState(0);
  const [connected, setConnected] = useState(false);

  // Subscribe to Firestore timer
  useEffect(() => {
    const unsub = subscribeWorkshopTimer(t => {
      setTimer(t);
      setConnected(true);
    });
    return () => unsub();
  }, []);

  // Tick locally so the display updates every second without Firestore writes
  useEffect(() => {
    const tick = () => setLocalSeconds(Math.max(0, Math.floor(getSecondsLeft(timer))));
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [timer]);

  const pagePhaseMeta = WORKSHOP_PHASES.find(p => p.id === pagePhase)!;

  // ── Not started yet ──────────────────────────────────────────────────────────
  if (!connected || timer.phase === 0) {
    return (
      <div className="relative sticky top-[57px] z-10"
        style={{ background: pagePhaseMeta.bg, borderBottom: `1px solid ${pagePhaseMeta.color}25` }}>
        <div className="max-w-3xl mx-auto px-6 py-2 flex items-center gap-2.5">
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
            style={{ background: pagePhaseMeta.color }}>
            {pagePhase}
          </span>
          <span className="text-xs font-bold" style={{ color: pagePhaseMeta.color }}>
            {pagePhaseMeta.label}
          </span>
          <span className="text-xs" style={{ color: pagePhaseMeta.color, opacity: 0.6 }}>
            · Esperant el facilitador...
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5"
          style={{ background: `${pagePhaseMeta.color}15` }} />
      </div>
    );
  }

  // ── Firestore has an active phase ────────────────────────────────────────────
  const activePhaseMeta = WORKSHOP_PHASES.find(p => p.id === timer.phase)!;
  const mins = Math.floor(localSeconds / 60);
  const secs = localSeconds % 60;
  const pct = timer.durationSeconds > 0 ? localSeconds / timer.durationSeconds : 1;

  const urgent = timer.running && localSeconds <= 60 && localSeconds > 0;
  const finished = localSeconds === 0 && timer.startedAt > 0 && !timer.running;

  const color = finished ? '#dc2626' : urgent ? '#ea580c' : timer.color;
  const bg = finished ? '#fef2f2' : urgent ? '#fff7ed' : timer.bg;

  const isMyPhase = timer.phase === pagePhase;
  const isFuturePhase = timer.phase < pagePhase; // facilitator is on an earlier phase
  const isPastPhase = timer.phase > pagePhase;   // facilitator has moved ahead

  return (
    <div className="relative sticky top-[57px] z-10" style={{ background: bg, borderBottom: `1px solid ${color}25` }}>
      <div className="max-w-3xl mx-auto px-6 py-2 flex items-center justify-between gap-4">

        {/* Left: phase info */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
            style={{ background: color }}>
            {timer.phase}
          </span>
          <span className="text-xs font-bold flex-shrink-0" style={{ color }}>
            {activePhaseMeta.label}
          </span>

          {/* Contextual note for wrong phase */}
          {isPastPhase && (
            <span className="text-xs font-medium flex-shrink-0" style={{ color, opacity: 0.85 }}>
              · Fase anterior completada — continua! →
            </span>
          )}
          {isFuturePhase && (
            <span className="text-xs hidden sm:inline truncate" style={{ color, opacity: 0.65 }}>
              · Espera l&apos;inici d&apos;aquesta fase
            </span>
          )}
          {isMyPhase && !finished && (
            <span className="text-xs hidden sm:inline truncate" style={{ color, opacity: 0.75 }}>
              · {timer.instruction}
            </span>
          )}
          {finished && isMyPhase && (
            <span className="text-xs font-bold flex-shrink-0" style={{ color }}>
              · Temps esgotat!
            </span>
          )}
        </div>

        {/* Right: time display */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!timer.running && !finished && timer.startedAt > 0 && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: `${color}20`, color }}>
              ⏸
            </span>
          )}
          <span className="font-mono font-black text-base tabular-nums" style={{ color }}>
            {finished ? '⏰ 0:00' : `${mins}:${String(secs).padStart(2, '0')}`}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: `${color}15` }}>
        <div className="h-full transition-all duration-500"
          style={{ width: `${pct * 100}%`, background: color, opacity: 0.45 }} />
      </div>
    </div>
  );
}
