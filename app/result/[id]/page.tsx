'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { getSubmission } from '@/lib/firebase';
import type { Submission } from '@/lib/types';
import { CONTEXT_THEMES } from '@/lib/types';

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!id) return;
    getSubmission(id as string).then(s => {
      setSubmission(s);
      setLoading(false);
    });
  }, [id]);

  const appUrl = origin ? `${origin}/app/${id}` : '';
  const theme = CONTEXT_THEMES.find(t => t.value === submission?.contextTheme);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#e63946] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-[#888]">Recurs no trobat.</p>
        <button onClick={() => router.push('/')} className="text-[#e63946] hover:underline">← Inici</button>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#2a2a2a]">
        <button onClick={() => router.push('/')} className="text-[#888] hover:text-white transition-colors text-sm">
          ← Inici
        </button>
        <span className="font-black text-[#e63946] tracking-tight">VIBE CODING</span>
        <button
          onClick={() => router.push('/create')}
          className="text-sm text-[#888] hover:text-white border border-[#2a2a2a] hover:border-[#444] rounded-lg px-3 py-1.5 transition-all"
        >
          + Nou recurs
        </button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-0 max-w-7xl mx-auto w-full p-6 gap-6">
        {/* Left: Preview iframe */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-[#2a2a2a] bg-[#141414] px-3 py-1 text-xs text-[#888]">
              👩‍🏫 {submission.rolLabel}
            </span>
            {theme && (
              <span
                className="rounded-full border px-3 py-1 text-xs"
                style={{ borderColor: `${theme.color}40`, color: theme.color, background: `${theme.color}10` }}
              >
                {theme.emoji} {theme.label}
              </span>
            )}
            <span className="rounded-full border border-[#2a2a2a] bg-[#141414] px-3 py-1 text-xs text-[#888]">
              ✨ {submission.formatLabel}
            </span>
            {submission.pairName && (
              <span className="rounded-full border border-[#e63946]/30 bg-[#e63946]/10 px-3 py-1 text-xs text-[#e63946]">
                {submission.pairName}
              </span>
            )}
          </div>

          {/* iframe preview */}
          <div className="relative rounded-2xl overflow-hidden border border-[#2a2a2a] bg-[#141414]" style={{ height: '520px' }}>
            <div className="absolute top-0 left-0 right-0 h-8 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center px-3 gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#2a2a2a]" />
              <div className="w-3 h-3 rounded-full bg-[#2a2a2a]" />
              <div className="w-3 h-3 rounded-full bg-[#2a2a2a]" />
              <div className="ml-2 flex-1 h-4 rounded bg-[#2a2a2a] max-w-xs" />
            </div>
            <iframe
              srcDoc={submission.htmlOutput}
              className="absolute top-8 left-0 right-0 bottom-0 w-full h-[calc(100%-2rem)]"
              sandbox="allow-scripts allow-forms"
              title="Recurs educatiu generat"
            />
          </div>

          {/* Full screen button */}
          <a
            href={`/app/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-[#2a2a2a] bg-[#141414] py-3 text-sm text-[#888] hover:text-white hover:border-[#444] transition-all"
          >
            ↗ Obrir en pantalla completa
          </a>
        </div>

        {/* Right: QR + info */}
        <div className="w-full lg:w-72 flex flex-col gap-4">
          {/* QR card */}
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-6 flex flex-col items-center gap-4">
            <div className="text-sm font-bold text-white">Accedeix al recurs</div>
            {appUrl && (
              <div className="bg-white p-3 rounded-xl">
                <QRCode value={appUrl} size={160} />
              </div>
            )}
            <div className="text-xs text-[#555] text-center break-all">{appUrl}</div>
          </div>

          {/* Prompt summary */}
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#141414] p-5 flex flex-col gap-3">
            <div className="text-xs font-bold text-[#888] uppercase tracking-widest">Resum del prompt</div>
            <div className="space-y-2">
              <Row label="ROL" value={submission.rolLabel} />
              <Row label="CONTEXT" value={submission.contextThemeLabel} />
              <Row label="TASCA" value={submission.tasca} truncate />
              <Row label="FORMAT" value={submission.formatLabel} />
            </div>
          </div>

          {/* New resource button */}
          <button
            onClick={() => router.push('/create')}
            className="rounded-2xl bg-[#e63946] py-4 text-white font-bold hover:bg-[#c1121f] transition-all hover:scale-[1.02]"
          >
            ✨ Crear un altre recurs
          </button>

          {/* Gallery link */}
          <a
            href="/gallery"
            className="rounded-2xl border border-[#2a2a2a] py-3 text-center text-sm text-[#888] hover:text-white hover:border-[#444] transition-all"
          >
            🖼️ Veure la galeria completa
          </a>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value, truncate }: { label: string; value: string; truncate?: boolean }) {
  return (
    <div className="flex gap-2">
      <span className="text-xs font-mono text-[#e63946] w-16 shrink-0 pt-0.5">{label}</span>
      <span className={`text-xs text-[#f5f5f5] ${truncate ? 'line-clamp-2' : ''}`}>{value}</span>
    </div>
  );
}
