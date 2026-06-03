'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EXAMPLES from '@/lib/examples.json';

export default function WarmupPage() {
  const router = useRouter();
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState(0);

  const ex = EXAMPLES[active];
  const isRevealed = revealed[ex.id];

  const PROMPTS: Record<string, { rol: string; context: string; tasca: string; format: string }> = {
    'example-quiz': {
      rol: 'Mestre/a de primària',
      context: 'Benestar emocional',
      tasca: 'Quiz per identificar emocions en situacions quotidianes de l\'aula per a alumnes de 4t de primària',
      format: 'Quiz interactiu',
    },
    'example-joc': {
      rol: 'Mestre/a de primària',
      context: 'Inclusió i diversitat',
      tasca: 'Joc de memory per practicar salutacions en 5 idiomes en una escola multicultural de cicle superior',
      format: 'Joc educatiu',
    },
    'example-rubrica': {
      rol: 'Tutor/a de classe',
      context: 'Avaluació i feedback',
      tasca: 'Rúbrica per avaluar el treball en equip en projectes de recerca per a alumnes de 6è de primària',
      format: 'Rúbrica d\'avaluació',
    },
  };

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

      <div className="max-w-4xl mx-auto w-full px-6 py-8 flex-1 flex flex-col">
        {/* Intro */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-sm font-bold border" style={{ borderColor: '#ea580c40', background: '#fff7ed', color: '#ea580c' }}>
            🔍 Warm-up · 5 minuts
          </div>
          <h1 className="text-3xl font-black mb-3" style={{ color: 'var(--heading)' }}>
            Endevina el prompt
          </h1>
          <p className="max-w-lg mx-auto" style={{ color: 'var(--muted)' }}>
            Explora aquesta webapp educativa. Intenta endevinar quines instruccions li vam donar a la IA per crear-la. Quan ho tinguis, revela el prompt!
          </p>
        </div>

        {/* Example navigation */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <button
            onClick={() => { setActive(i => Math.max(0, i - 1)); }}
            disabled={active === 0}
            className="rounded-xl px-4 py-2 text-sm font-medium transition-all flex items-center gap-2"
            style={active === 0
              ? { background: '#f0eaf0', color: 'var(--border)', cursor: 'not-allowed' }
              : { background: '#f7f4f7', color: 'var(--heading)', border: '1px solid var(--border)' }
            }
          >
            ← Anterior
          </button>

          <div className="flex gap-2 flex-wrap justify-center">
            {EXAMPLES.map((e, i) => (
              <button
                key={e.id}
                onClick={() => setActive(i)}
                className="rounded-full px-4 py-2 text-sm font-medium transition-all"
                style={active === i
                  ? { background: 'var(--heading)', color: 'white' }
                  : { background: '#f7f4f7', color: 'var(--muted)', border: '1px solid var(--border)' }
                }
              >
                {i + 1}. {e.title}
              </button>
            ))}
          </div>

          <button
            onClick={() => { setActive(i => Math.min(EXAMPLES.length - 1, i + 1)); }}
            disabled={active === EXAMPLES.length - 1}
            className="rounded-xl px-4 py-2 text-sm font-medium transition-all flex items-center gap-2"
            style={active === EXAMPLES.length - 1
              ? { background: '#f0eaf0', color: 'var(--border)', cursor: 'not-allowed' }
              : { background: '#f7f4f7', color: 'var(--heading)', border: '1px solid var(--border)' }
            }
          >
            Següent →
          </button>
        </div>

        {/* Webapp iframe */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="relative rounded-2xl overflow-hidden flex-1 min-h-[480px]" style={{ border: '1.5px solid var(--border)' }}>
            {/* Browser chrome */}
            <div className="flex items-center gap-1.5 px-4 py-2 border-b" style={{ background: '#f7f4f7', borderColor: 'var(--border)' }}>
              <div className="w-3 h-3 rounded-full" style={{ background: '#e5e5e5' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#e5e5e5' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#e5e5e5' }} />
              <span className="ml-3 text-xs" style={{ color: 'var(--muted)' }}>webapp educativa generada per IA</span>
            </div>
            <iframe
              key={ex.id}
              srcDoc={ex.html}
              className="w-full h-full min-h-[440px]"
              sandbox="allow-scripts allow-forms"
              title={ex.title}
            />
          </div>

          {/* Reveal area */}
          <div className="rounded-2xl p-6" style={{ background: '#f7f4f7', border: '1.5px solid var(--border)' }}>
            {!isRevealed ? (
              <div className="text-center">
                <p className="text-sm mb-4 font-medium" style={{ color: 'var(--heading)' }}>
                  💭 Quines instruccions creus que li vam donar a la IA?
                </p>
                <p className="text-xs mb-6" style={{ color: 'var(--muted)' }}>
                  Pensa en: qui ho demana, per a qui és, quin és el repte, quin format té...
                </p>
                <button
                  onClick={() => setRevealed(r => ({ ...r, [ex.id]: true }))}
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
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(PROMPTS[ex.id]).map(([key, val]) => (
                    <div key={key} className="rounded-xl p-3" style={{ background: 'white', border: '1px solid var(--border)' }}>
                      <div className="text-xs font-mono font-bold mb-1 uppercase" style={{ color: 'var(--accent)' }}>{key}</div>
                      <div className="text-sm font-medium" style={{ color: 'var(--body)' }}>{val}</div>
                    </div>
                  ))}
                </div>
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
