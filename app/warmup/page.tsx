'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EXAMPLES from '@/lib/examples.json';
import { PhaseTimer } from '@/components/PhaseTimer';

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
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <button onClick={() => router.push('/')} className="text-sm" style={{ color: 'var(--muted)' }}>
          ← Inici
        </button>
        <span className="font-black" style={{ color: 'var(--heading)' }}>Vibe Coding</span>
        <div className="w-16" />
      </header>

      {/* Phase timer */}
      <PhaseTimer
        phase={1}
        label="Warm-up"
        defaultMinutes={5}
        instruction="Explora l'app i endevina el prompt que la va generar"
        color="#ea580c"
        bg="#fff7ed"
      />

      <div className="max-w-3xl mx-auto w-full px-6 py-8 flex-1 flex flex-col">
        {/* Intro */}
        <div className="mb-6">
          <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--heading)' }}>
            Endevina el prompt
          </h1>
          <p style={{ color: 'var(--muted)' }}>
            Explora aquesta webapp educativa generada per IA. Intenta endevinar quines instruccions li vam donar. Quan ho tinguis, revela el prompt!
          </p>
        </div>

        {/* Instructions */}
        <div className="rounded-2xl p-4 mb-5 flex flex-col gap-2" style={{ background: '#f0fdfb', border: '1.5px solid #0d948825' }}>
          <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#0d9488' }}>Com funciona</div>
          <ol className="text-sm flex flex-col gap-1" style={{ color: 'var(--body)' }}>
            <li>1. Prova l&apos;app interactiva de sota — juga-hi, toca-ho tot</li>
            <li>2. Pensa quin podria ser el <strong>Eix</strong>, <strong>Usuari</strong>, <strong>Acció</strong>, <strong>Repte</strong> i <strong>Estil</strong></li>
            <li>3. Clica &ldquo;Revela el prompt&rdquo; per veure la resposta</li>
          </ol>
        </div>

        {/* Webapp iframe */}
        <div className="flex flex-col gap-4 flex-1">
          <div className="relative rounded-2xl overflow-hidden flex-1 min-h-[480px]" style={{ border: '1.5px solid var(--border)' }}>
            <div className="flex items-center gap-1.5 px-4 py-2 border-b" style={{ background: '#f7f4f7', borderColor: 'var(--border)' }}>
              <div className="w-3 h-3 rounded-full" style={{ background: '#e5e5e5' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#e5e5e5' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#e5e5e5' }} />
              <span className="ml-3 text-xs" style={{ color: 'var(--muted)' }}>{example.title}</span>
            </div>
            <iframe
              key={example.id}
              srcDoc={example.html}
              className="w-full h-full min-h-[440px]"
              sandbox="allow-scripts allow-forms"
              title={example.title}
            />
          </div>

          {/* Reveal area */}
          <div className="rounded-2xl p-6" style={{ background: '#f7f4f7', border: '1.5px solid var(--border)' }}>
            {!revealed ? (
              <div className="text-center">
                <p className="text-sm mb-2 font-medium" style={{ color: 'var(--heading)' }}>
                  💭 Quines instruccions creus que li vam donar a la IA?
                </p>
                <p className="text-xs mb-5" style={{ color: 'var(--muted)' }}>
                  Pensa en: qui ho demana, per a qui és, quin és el repte, quin format té...
                </p>
                <button
                  onClick={() => setRevealed(true)}
                  className="rounded-xl px-6 py-3 font-bold text-white transition-all hover:opacity-90"
                  style={{ background: 'var(--heading)' }}
                >
                  🔓 Revela el prompt
                </button>
              </div>
            ) : (
              <div>
                <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--heading)' }}>
                  El prompt que vam usar
                </div>
                <p className="text-sm leading-[2.4]" style={{ color: 'var(--body)' }}>
                  &ldquo;Crea una aplicació web emmarcada dins l&apos;eix de{' '}
                  <WBadge v={PROMPT.eix} color="#0d9488" bg="#f0fdfb" emoji="🎯" />,{' '}
                  pensada perquè la faci servir{' '}
                  <WBadge v={PROMPT.usuari} color="#7c3aed" bg="#f5f3ff" emoji="👤" />,{' '}
                  a través de{' '}
                  <WBadge v={PROMPT.accio} color="#2563eb" bg="#eff6ff" emoji="⚡" />{' '}
                  que serveixi per a{' '}
                  <WBadge v={PROMPT.repte} color="#ea580c" bg="#fff7ed" emoji="💡" />,{' '}
                  amb un estil{' '}
                  <WBadge v={PROMPT.estil} color="#be185d" bg="#fdf2f8" emoji="🎨" />,{' '}
                  que sigui coherent i fàcil d&apos;usar.&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-sm px-4 py-2 rounded-lg"
            style={{ color: 'var(--muted)' }}
          >
            ← Tornar a l&apos;inici
          </button>
          <button
            onClick={() => router.push('/create')}
            className="rounded-xl px-8 py-4 font-bold text-white text-lg transition-all hover:opacity-90 flex items-center gap-2"
            style={{ background: 'var(--heading)' }}
          >
            Ara crea el teu recurs
            <span>→</span>
          </button>
        </div>
      </div>
    </main>
  );
}
