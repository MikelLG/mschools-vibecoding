'use client';

import { useEffect, useState } from 'react';
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

export default function ScreenPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [latestId, setLatestId] = useState<string | null>(null);

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
    });
    return () => unsub();
  }, []);

  const cols =
    submissions.length <= 2 ? 'grid-cols-2' :
    submissions.length <= 4 ? 'grid-cols-2' :
    submissions.length <= 6 ? 'grid-cols-3' :
    submissions.length <= 9 ? 'grid-cols-3' :
    'grid-cols-4';

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b px-8 py-4" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black" style={{ color: 'var(--heading)' }}>Vibe Coding · Pantalla</h1>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              mSchools 2026 · {submissions.length} recurs{submissions.length !== 1 ? 'os' : ''} en temps real
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full px-4 py-2" style={{ border: '1.5px solid var(--border)', background: '#f7f4f7' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
            <span className="text-sm font-mono" style={{ color: 'var(--muted)' }}>LIVE</span>
          </div>
        </div>

        {/* Eix counts */}
        {submissions.length > 0 && (
          <div className="mt-3 flex gap-3 flex-wrap">
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
          </div>
        )}
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
      {/* iframe preview */}
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

      {/* Info */}
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
