'use client';

import { useEffect, useState } from 'react';
import { subscribeSubmissions } from '@/lib/firebase';
import type { Submission } from '@/lib/types';
import { CONTEXT_THEMES, FORMAT_OPTIONS } from '@/lib/types';

const SESSION_ID = process.env.NEXT_PUBLIC_SESSION_ID ?? 'mschools-2026';

export default function GalleryPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    return subscribeSubmissions(SESSION_ID, setSubmissions);
  }, []);

  const filtered = filter === 'all' ? submissions : submissions.filter(s => s.contextTheme === filter);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0a0a]/90 backdrop-blur border-b border-[#2a2a2a] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black">
              VIBE<span className="text-[#e63946]">CODING</span>
            </h1>
            <p className="text-xs text-[#555]">mSchools 2026 · {submissions.length} recursos</p>
          </div>
          <a
            href="/create"
            className="rounded-xl bg-[#e63946] px-4 py-2 text-sm font-bold text-white hover:bg-[#c1121f] transition-all"
          >
            + Crear
          </a>
        </div>

        {/* Filter bar */}
        <div className="max-w-4xl mx-auto mt-3 flex gap-2 overflow-x-auto pb-1">
          <FilterChip active={filter === 'all'} onClick={() => setFilter('all')} label="Tots" emoji="✨" />
          {CONTEXT_THEMES.map(t => (
            <FilterChip
              key={t.value}
              active={filter === t.value}
              onClick={() => setFilter(t.value)}
              label={t.label}
              emoji={t.emoji}
              color={t.color}
            />
          ))}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-6">
        {submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="text-5xl mb-4 opacity-30">🏫</div>
            <p className="text-[#555] text-lg font-bold">Cap recurs encara</p>
            <p className="text-[#333] text-sm mt-1">Ves a l'estació i crea el primer!</p>
            <a href="/create" className="mt-6 rounded-xl bg-[#e63946] px-6 py-3 text-sm font-bold text-white hover:bg-[#c1121f] transition-all">
              Crear recurs →
            </a>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-32 text-center text-[#555]">Cap recurs amb aquest filtre.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map(s => (
              <GalleryCard key={s.id} submission={s} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function FilterChip({ active, onClick, label, emoji, color }: {
  active: boolean; onClick: () => void; label: string; emoji: string; color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
        active
          ? 'border-[#e63946] bg-[#e63946]/10 text-[#e63946]'
          : 'border-[#2a2a2a] bg-[#141414] text-[#888] hover:border-[#444]'
      }`}
      style={active && color ? { borderColor: color, background: `${color}15`, color } : {}}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  );
}

function GalleryCard({ submission: s }: { submission: Submission }) {
  const theme = CONTEXT_THEMES.find(t => t.value === s.contextTheme);
  const fmt = FORMAT_OPTIONS.find(f => f.value === s.format);
  const timeAgo = getTimeAgo(s.createdAt);

  return (
    <a
      href={`/app/${s.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden hover:border-[#444] hover:scale-[1.02] transition-all"
    >
      {/* Mini preview */}
      <div className="relative h-40 overflow-hidden bg-white/5">
        <iframe
          srcDoc={s.htmlOutput}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transform: 'scale(0.4)', transformOrigin: 'top left', width: '250%', height: '250%' }}
          sandbox="allow-scripts"
          title={s.formatLabel}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#141414]" />
        <div
          className="absolute top-2 left-2 rounded-lg px-2 py-1 text-xs font-bold"
          style={{ background: theme ? `${theme.color}20` : '#1a1a1a', color: theme?.color ?? '#888', border: `1px solid ${theme?.color ?? '#2a2a2a'}40` }}
        >
          {theme?.emoji} {theme?.label}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{fmt?.emoji ?? '✨'}</span>
          <span className="font-bold text-sm text-white">{s.formatLabel}</span>
        </div>
        <p className="text-xs text-[#888] line-clamp-2">{s.tasca}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-[#555]">{s.rolLabel}</span>
          <span className="text-xs text-[#333]">{timeAgo}</span>
        </div>
        {s.pairName && (
          <div className="text-xs font-mono text-[#e63946]">{s.pairName}</div>
        )}
      </div>
    </a>
  );
}

function getTimeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'ara mateix';
  if (min < 60) return `fa ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `fa ${h}h`;
  return `fa ${Math.floor(h / 24)}d`;
}
