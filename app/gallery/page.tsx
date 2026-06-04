'use client';

import { useEffect, useState } from 'react';
import { subscribeSubmissions } from '@/lib/firebase';
import type { Submission } from '@/lib/types';
import QRCode from 'react-qr-code';

const SESSION_ID = process.env.NEXT_PUBLIC_SESSION_ID ?? 'mschools-2026';

const EIXOS = [
  { value: 'Benestar social', emoji: '🤝', color: '#0d9488', bg: '#f0fdfb' },
  { value: 'Educació mediàtica', emoji: '📱', color: '#7c3aed', bg: '#f5f3ff' },
  { value: 'Consciència social', emoji: '🌍', color: '#ea580c', bg: '#fff7ed' },
  { value: 'Art i creativitat', emoji: '🎨', color: '#2563eb', bg: '#eff6ff' },
  { value: 'Equitat i inclusió', emoji: '🌈', color: '#be185d', bg: '#fdf2f8' },
  { value: 'Cultura i diversitat', emoji: '🏛️', color: '#16a34a', bg: '#f0fdf4' },
];

function getTimeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'ara mateix';
  if (min < 60) return `fa ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `fa ${h}h`;
  return `fa ${Math.floor(h / 24)}d`;
}

export default function GalleryPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState('all');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
    return subscribeSubmissions(SESSION_ID, setSubmissions);
  }, []);

  const filtered = filter === 'all'
    ? submissions
    : submissions.filter(s => s.contextTheme === filter || s.contextThemeLabel === filter);

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b px-6 py-4" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black" style={{ color: 'var(--heading)' }}>Galeria</h1>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>
              mSchools 2026 · {submissions.length} recurs{submissions.length !== 1 ? 'os' : ''}
            </p>
          </div>
          <a
            href="/create"
            className="rounded-xl px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--heading)' }}
          >
            + Crear
          </a>
        </div>

        {/* Filter chips */}
        <div className="max-w-5xl mx-auto mt-3 flex gap-2 overflow-x-auto pb-1">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="Tots" emoji="✨" />
          {EIXOS.map(e => (
            <FilterChip
              key={e.value}
              active={filter === e.value}
              onClick={() => setFilter(e.value)}
              label={e.value}
              emoji={e.emoji}
              color={e.color}
              bg={e.bg}
            />
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-6">
        {submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="text-5xl mb-4">🏫</div>
            <p className="text-lg font-bold mb-1" style={{ color: 'var(--heading)' }}>Cap recurs encara</p>
            <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>Ves a l&apos;estació i crea el primer!</p>
            <a
              href="/create"
              className="rounded-xl px-6 py-3 text-sm font-bold text-white transition-all hover:opacity-90"
              style={{ background: 'var(--heading)' }}
            >
              Crear recurs →
            </a>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center text-sm" style={{ color: 'var(--muted)' }}>
            Cap recurs amb aquest filtre.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(s => (
              <GalleryCard key={s.id} submission={s} origin={origin} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function FilterChip({ active, onClick, label, emoji, color, bg }: {
  active: boolean; onClick: () => void; label: string; emoji: string; color?: string; bg?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all border"
      style={active && color
        ? { borderColor: `${color}60`, background: bg, color }
        : active
        ? { borderColor: 'var(--heading)', background: '#f0eaf5', color: 'var(--heading)' }
        : { borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--muted)' }
      }
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  );
}

function GalleryCard({ submission: s, origin }: { submission: Submission; origin: string }) {
  const eix = EIXOS.find(e => e.value === s.contextTheme || e.value === s.contextThemeLabel);
  const appUrl = origin ? `${origin}/app/${s.id}` : '';
  const timeAgo = getTimeAgo(s.createdAt);

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden transition-all hover:scale-[1.02]"
      style={{ border: '1.5px solid var(--border)', background: 'var(--bg)' }}
    >
      {/* Mini iframe preview */}
      <a href={`/app/${s.id}`} target="_blank" rel="noopener noreferrer" className="block">
        <div className="relative h-44 overflow-hidden" style={{ background: '#f7f4f7' }}>
          <iframe
            srcDoc={s.htmlOutput}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ transform: 'scale(0.4)', transformOrigin: 'top left', width: '250%', height: '250%' }}
            sandbox="allow-scripts"
            title={s.formatLabel}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 60%, #f7f4f7)' }} />
          {eix && (
            <div
              className="absolute top-2 left-2 rounded-full px-2.5 py-1 text-xs font-bold"
              style={{ background: eix.bg, color: eix.color, border: `1px solid ${eix.color}30` }}
            >
              {eix.emoji} {eix.value}
            </div>
          )}
        </div>
      </a>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <div className="font-bold text-sm mb-1" style={{ color: 'var(--heading)' }}>
            {s.formatLabel || s.tasca?.split('·')[3]?.trim() || 'Recurs educatiu'}
          </div>
          <p className="text-xs line-clamp-2" style={{ color: 'var(--muted)' }}>{s.tasca}</p>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div>
            {s.pairName && (
              <span className="text-xs font-bold" style={{ color: 'var(--heading)' }}>{s.pairName}</span>
            )}
            <div className="text-xs" style={{ color: 'var(--muted)' }}>{timeAgo}</div>
          </div>
          {/* Mini QR */}
          {appUrl && (
            <a href={`/app/${s.id}`} target="_blank" rel="noopener noreferrer" title="Obrir app">
              <div className="p-1.5 rounded-lg bg-white" style={{ border: '1px solid var(--border)' }}>
                <QRCode value={appUrl} size={48} />
              </div>
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <a
            href={`/app/${s.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-xs font-bold py-2 rounded-lg transition-all"
            style={{ background: '#f7f4f7', color: 'var(--heading)', border: '1px solid var(--border)' }}
          >
            Obrir app ↗
          </a>
          <a
            href={`/result/${s.id}`}
            className="flex-1 text-center text-xs font-bold py-2 rounded-lg transition-all"
            style={{ background: 'var(--heading)', color: 'white' }}
          >
            Veure resultat
          </a>
        </div>
      </div>
    </div>
  );
}
