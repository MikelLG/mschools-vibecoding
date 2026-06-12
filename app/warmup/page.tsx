'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EXAMPLES from '@/lib/examples.json';
import { PhaseTimer } from '@/components/PhaseTimer';
import { MSchoolsLogo } from '@/components/MSchoolsLogo';

function WBadge({ v, color, bg, emoji }: { v: string; color: string; bg: string; emoji: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold align-middle"
      style={{ color, background: bg, border: `1.5px solid ${color}50` }}
    >
      <span>{emoji}</span>{v}
    </span>
  );
}

const PROMPT: { eix: string; usuari: string; accio: string; repte: string; estil: string } = {
  eix: 'Benestar social',
  usuari: 'Alumnat',
  accio: 'Crear un mini-joc',
  repte: 'Practicar un contingut',
  estil: 'Colors suaus',
};

const example = EXAMPLES[0];

export default function WarmupPage() {
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <button onClick={() => router.push('/')} className="text-sm" style={{ color: 'var(--muted)' }}>← Inici</button>
        <div className="flex items-center gap-2">
          <MSchoolsLogo size="sm" />
          <span style={{ color: 'var(--border)', fontSize: 14 }}>·</span>
          <span className="font-black text-sm" style={{ color: 'var(--heading)' }}>Vibe Coding</span>
        </div>
        <div className="w-16" />
      </header>

      <PhaseTimer pagePhase={1} />

      {/* Two-column layout */}
      <div className="flex" style={{ alignItems: 'flex-start' }}>

        {/* Left panel — sticky sidebar */}
        <div className="flex flex-col px-6 py-6 gap-5" style={{ width: 320, minWidth: 300, flexShrink: 0, borderRight: '1.5px solid var(--border)', position: 'sticky', top: 40, maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>
          <div>
            <h1 className="text-xl font-black mb-1" style={{ color: 'var(--heading)' }}>Endevina el prompt</h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              Explora aquesta webapp generada per IA i intenta endevinar quines instruccions li vam donar.
            </p>
          </div>

          <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: '#f0fdfb', border: '1.5px solid #0d948825' }}>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#0d9488' }}>Com funciona</div>
            <ol className="text-sm flex flex-col gap-1.5" style={{ color: 'var(--body)' }}>
              <li>1. <strong>Juga amb l&apos;app</strong> — toca-ho tot</li>
              <li>2. Pensa quin podria ser el <strong>Eix</strong>, <strong>Usuari</strong>, <strong>Acció</strong>, <strong>Repte</strong> i <strong>Estil</strong></li>
              <li>3. Clica <strong>&ldquo;Revela el prompt&rdquo;</strong></li>
            </ol>
          </div>

          <div className="rounded-xl p-5" style={{ background: '#f7f4f7', border: '1.5px solid var(--border)' }}>
            {!revealed ? (
              <div className="flex flex-col items-center text-center gap-4">
                <p className="text-sm font-medium" style={{ color: 'var(--heading)' }}>
                  💭 Quines instruccions creus que li vam donar a la IA?
                </p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Pensa en: qui ho demana, per a qui és, quin és el repte, quin format té...
                </p>
                <button
                  onClick={() => setRevealed(true)}
                  className="w-full rounded-xl px-4 py-3 font-bold text-white transition-all hover:opacity-90"
                  style={{ background: 'var(--heading)' }}
                >
                  🔓 Revela el prompt
                </button>
              </div>
            ) : (
              <div>
                <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--heading)' }}>
                  El pre-prompt que vam usar
                </div>
                <p className="text-sm leading-[2.4]" style={{ color: 'var(--body)' }}>
                  &ldquo;Crea una aplicació web emmarcada dins de l&apos;eix de{' '}
                  <WBadge v={PROMPT.eix} color="#0d9488" bg="#f0fdfb" emoji="🎯" />,{' '}
                  pensada perquè la utilitzi{' '}
                  <WBadge v={PROMPT.usuari} color="#7c3aed" bg="#f5f3ff" emoji="👤" />,{' '}
                  serveixi per{' '}
                  <WBadge v={PROMPT.repte} color="#ea580c" bg="#fff7ed" emoji="💡" />,{' '}
                  a través de{' '}
                  <WBadge v={PROMPT.accio} color="#2563eb" bg="#eff6ff" emoji="⚡" />,{' '}
                  amb un estil{' '}
                  <WBadge v={PROMPT.estil} color="#be185d" bg="#fdf2f8" emoji="🎨" />,{' '}
                  que resulti coherent i fàcil d&apos;usar.&rdquo;
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => router.push('/create')}
            className="w-full rounded-xl px-6 py-4 font-bold text-white text-base transition-all hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: 'var(--heading)' }}
          >
            Crea el teu recurs →
          </button>
        </div>

        {/* Right panel — iframe, tall enough to show the full app */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-center gap-1.5 px-4 py-2 border-b" style={{ background: '#f7f4f7', borderColor: 'var(--border)' }}>
            <div className="w-3 h-3 rounded-full" style={{ background: '#e5e5e5' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#e5e5e5' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#e5e5e5' }} />
            <span className="ml-3 text-xs" style={{ color: 'var(--muted)' }}>{example.title}</span>
          </div>
          <iframe
            key={example.id}
            srcDoc={example.html.replace('</head>', '<style>body{overflow:auto!important;height:auto!important;min-height:100%}</style></head>')}
            style={{ width: '100%', height: 'calc(100vh - 120px)', border: 'none', display: 'block' }}
            sandbox="allow-scripts allow-forms"
            title={example.title}
          />
        </div>

      </div>
    </main>
  );
}
