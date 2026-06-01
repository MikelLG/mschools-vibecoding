'use client';

import { useEffect, useState } from 'react';
import { subscribeSubmissions } from '@/lib/firebase';
import type { Submission } from '@/lib/types';
import { CONTEXT_THEMES } from '@/lib/types';

const SESSION_ID = process.env.NEXT_PUBLIC_SESSION_ID ?? 'mschools-2026';

export default function ScreenPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [latest, setLatest] = useState<Submission | null>(null);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    const unsub = subscribeSubmissions(SESSION_ID, (subs) => {
      setSubmissions(prev => {
        if (subs.length > prev.length && subs.length > 0) {
          setLatest(subs[0]);
          setShowNew(true);
          setTimeout(() => setShowNew(false), 4000);
        }
        return subs;
      });
    });
    return () => unsub();
  }, []);

  return (
    <main className="min-h-screen bg-[#050505] overflow-hidden flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-10 py-5 border-b border-[#1a1a1a]">
        <div>
          <div className="text-xs text-[#555] uppercase tracking-widest font-mono">mSchools Awards 2026</div>
          <h1 className="text-3xl font-black tracking-tighter">
            VIBE<span className="text-[#e63946]">CODING</span>
            <span className="text-[#333] ml-2 text-xl font-normal">— Recursos generats</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-2">
            <span className="w-2 h-2 rounded-full bg-[#e63946] animate-pulse" />
            <span className="text-sm text-[#888] font-mono">{submissions.length} recursos</span>
          </div>
        </div>
      </header>

      {/* New submission toast */}
      {showNew && latest && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right-4 rounded-2xl border border-[#e63946]/30 bg-[#e63946]/10 p-4 max-w-xs backdrop-blur-sm">
          <div className="text-xs text-[#e63946] font-bold mb-1">✨ Nou recurs!</div>
          <div className="text-sm text-white font-medium">{latest.formatLabel}</div>
          <div className="text-xs text-[#888]">{latest.contextThemeLabel}</div>
        </div>
      )}

      {/* Empty state */}
      {submissions.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
          <div className="text-6xl opacity-20">✨</div>
          <p className="text-[#333] text-xl font-bold">Esperant els primers recursos...</p>
          <p className="text-[#222] text-sm">Els recursos apareixeran aquí en temps real</p>
        </div>
      )}

      {/* Grid */}
      {submissions.length > 0 && (
        <div className="flex-1 p-8 overflow-hidden">
          <div className={`grid gap-5 h-full ${
            submissions.length <= 2 ? 'grid-cols-2' :
            submissions.length <= 4 ? 'grid-cols-2 grid-rows-2' :
            submissions.length <= 6 ? 'grid-cols-3 grid-rows-2' :
            'grid-cols-4 grid-rows-2'
          }`}>
            {submissions.slice(0, 8).map((s, i) => (
              <SubmissionCard key={s.id} submission={s} isNew={i === 0 && showNew} />
            ))}
          </div>
        </div>
      )}

      {/* Footer bar */}
      <footer className="flex items-center justify-between px-10 py-3 border-t border-[#1a1a1a]">
        <div className="flex gap-4">
          {CONTEXT_THEMES.map(t => {
            const count = submissions.filter(s => s.contextTheme === t.value).length;
            if (count === 0) return null;
            return (
              <div key={t.value} className="flex items-center gap-1.5">
                <span className="text-sm">{t.emoji}</span>
                <span className="text-xs text-[#555]">{count}</span>
              </div>
            );
          })}
        </div>
        <div className="text-xs text-[#222] font-mono">LIVE · mSchools 2026</div>
      </footer>
    </main>
  );
}

function SubmissionCard({ submission: s, isNew }: { submission: Submission; isNew: boolean }) {
  const theme = CONTEXT_THEMES.find(t => t.value === s.contextTheme);

  return (
    <a
      href={`/app/${s.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative flex flex-col rounded-2xl border overflow-hidden transition-all hover:scale-[1.02] ${
        isNew ? 'border-[#e63946]/50 shadow-[0_0_30px_rgba(230,57,70,0.15)]' : 'border-[#1a1a1a] hover:border-[#2a2a2a]'
      }`}
      style={{ background: theme ? `linear-gradient(135deg, ${theme.color}08, #0a0a0a)` : '#0a0a0a' }}
    >
      {isNew && (
        <div className="absolute top-3 right-3 z-10 rounded-full bg-[#e63946] px-2 py-0.5 text-xs font-bold text-white">
          NOU
        </div>
      )}

      {/* Mini iframe preview */}
      <div className="flex-1 relative overflow-hidden bg-white/5">
        <iframe
          srcDoc={s.htmlOutput}
          className="absolute inset-0 w-full h-full"
          style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%', pointerEvents: 'none' }}
          sandbox="allow-scripts"
          title={s.formatLabel}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a] opacity-60" />
      </div>

      {/* Bottom info */}
      <div className="p-4 border-t border-[#1a1a1a]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{theme?.emoji ?? '✨'}</span>
          <span className="text-sm font-bold text-white truncate">{s.formatLabel}</span>
        </div>
        <div className="text-xs text-[#555] truncate">{s.contextThemeLabel}</div>
        {s.pairName && (
          <div className="mt-1.5 text-xs font-mono text-[#e63946]">{s.pairName}</div>
        )}
      </div>
    </a>
  );
}
