'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Submission } from '@/lib/types';

// ── Card groups ────────────────────────────────────────────────────────────────

const GROUPS = [
  {
    id: 'eixos',
    label: 'Eixos',
    question: 'Per a quina àrea temàtica?',
    color: '#0d9488', bg: '#f0fdfb', emoji: '🎯',
    fragment: (v: string) => `l'àrea de ${v}`,
    cards: [
      { value: 'matemàtiques', label: 'Matemàtiques', emoji: '🔢' },
      { value: 'llengua catalana', label: 'Llengua', emoji: '📖' },
      { value: 'ciències naturals', label: 'Ciències naturals', emoji: '🔬' },
      { value: 'ciències socials', label: 'Ciències socials', emoji: '🌍' },
      { value: 'educació emocional', label: 'Educació emocional', emoji: '💚' },
      { value: 'arts i creativitat', label: 'Arts i creativitat', emoji: '🎨' },
    ],
  },
  {
    id: 'persona',
    label: 'Persona',
    question: 'Per a qui és?',
    color: '#7c3aed', bg: '#f5f3ff', emoji: '👤',
    fragment: (v: string) => `adreçat a ${v}`,
    cards: [
      { value: 'alumnat de primària (6-12 anys)', label: 'Alumnat primària', emoji: '👧' },
      { value: 'alumnat d\'ESO (12-16 anys)', label: 'Alumnat ESO', emoji: '🧑' },
      { value: 'el docent', label: 'El docent', emoji: '👨‍🏫' },
      { value: 'les famílies', label: 'Les famílies', emoji: '👨‍👩‍👧' },
      { value: 'tot el grup classe', label: 'Grup classe', emoji: '🏫' },
      { value: 'alumnat amb necessitats específiques', label: 'Alumnat NEE', emoji: '♿' },
    ],
  },
  {
    id: 'repte',
    label: 'Repte',
    question: 'Quin és el repte educatiu?',
    color: '#ea580c', bg: '#fff7ed', emoji: '💡',
    fragment: (v: string) => `per ${v}`,
    cards: [
      { value: 'l\'autoavaluació de l\'alumnat', label: 'Autoavaluació', emoji: '📝' },
      { value: 'reforçar continguts treballats', label: 'Reforç de continguts', emoji: '🎯' },
      { value: 'facilitar el treball cooperatiu', label: 'Treball cooperatiu', emoji: '🤝' },
      { value: 'l\'avaluació formativa del docent', label: 'Avaluació formativa', emoji: '✅' },
      { value: 'millorar la comunicació amb les famílies', label: 'Comunicació famílies', emoji: '📣' },
      { value: 'activar els coneixements previs', label: 'Activació coneixements', emoji: '🧠' },
    ],
  },
  {
    id: 'estil',
    label: 'Estil',
    question: 'Quin estil ha de tenir?',
    color: '#2563eb', bg: '#eff6ff', emoji: '🎨',
    fragment: (v: string) => `amb un format ${v}`,
    cards: [
      { value: 'lúdic i gamificat', label: 'Lúdic i gamificat', emoji: '🎮' },
      { value: 'visual i gràfic', label: 'Visual i gràfic', emoji: '🖼️' },
      { value: 'estructurat i clar', label: 'Estructurat i clar', emoji: '📋' },
      { value: 'inclusiu i accessible', label: 'Inclusiu i accessible', emoji: '🌈' },
      { value: 'ràpid i directe', label: 'Ràpid i directe', emoji: '⚡' },
      { value: 'narratiu i creatiu', label: 'Narratiu i creatiu', emoji: '✍️' },
    ],
  },
  {
    id: 'restriccions',
    label: 'Restriccions',
    question: 'Alguna restricció tècnica?',
    color: '#16a34a', bg: '#f0fdf4', emoji: '⚙️',
    fragment: (v: string) => `que sigui ${v}`,
    cards: [
      { value: 'compatible amb mòbil i tauleta', label: 'Compatible mòbil', emoji: '📱' },
      { value: 'imprimible en paper', label: 'Imprimible', emoji: '🖨️' },
      { value: 'usable en menys de 10 minuts', label: 'Màxim 10 minuts', emoji: '⏱️' },
      { value: 'sense necessitat de login', label: 'Sense login', emoji: '🔓' },
      { value: 'sense efectes de so', label: 'Sense so', emoji: '🔇' },
      { value: 'disponible en català i castellà', label: 'Bilingüe', emoji: '🌐' },
    ],
  },
] as const;

const FORMAT_OPTIONS = [
  { value: 'quiz', label: 'Quiz interactiu', emoji: '🎯', desc: 'Preguntes amb resposta i feedback' },
  { value: 'activitat', label: 'Activitat per a l\'aula', emoji: '📚', desc: 'Fitxa o exercici interactiu' },
  { value: 'rubrica', label: 'Rúbrica d\'avaluació', emoji: '✅', desc: 'Criteris amb puntuació' },
  { value: 'formulari', label: 'Formulari per a famílies', emoji: '📝', desc: 'Comunicat o enquesta' },
  { value: 'joc', label: 'Joc educatiu', emoji: '🎮', desc: 'Dinàmica lúdica amb objectiu pedagògic' },
  { value: 'suport', label: 'Material de suport', emoji: '🔧', desc: 'Recurs visual o guia pràctica' },
] as const;

// ── Component ──────────────────────────────────────────────────────────────────

type Selections = Record<string, string>;

export default function CreatePage() {
  const router = useRouter();
  const [selections, setSelections] = useState<Selections>({});
  const [pairName, setPairName] = useState('');
  const [extraContext, setExtraContext] = useState('');
  const [format, setFormat] = useState('');
  const [formatLabel, setFormatLabel] = useState('');
  const [listening, setListening] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const completedGroups = GROUPS.filter(g => selections[g.id]).length;
  const canGenerate = completedGroups === GROUPS.length && !!format;

  // Build live prompt preview sentence
  const promptPreview = GROUPS.map(g => {
    const val = selections[g.id];
    return val ? g.fragment(val) : `[${g.label.toLowerCase()}]`;
  }).join(', ');

  const startVoice = useCallback(() => {
    const SR = (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'ca-ES';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const t = e.results[0][0].transcript;
      setExtraContext(prev => prev ? prev + ' ' + t : t);
    };
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  }, []);

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const generate = async () => {
    setGenerating(true);
    setError('');
    try {
      const selectedCards = GROUPS.map(g => ({
        group: g.label,
        value: selections[g.id],
      }));

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedCards,
          promptPreview,
          extraContext,
          format,
          formatLabel,
          pairName,
          sessionId: process.env.NEXT_PUBLIC_SESSION_ID ?? 'mschools-2026',
        }),
      });
      if (!res.ok) throw new Error('Error de generació');
      const { submission } = await res.json() as { submission: Submission };
      const { saveSubmission } = await import('@/lib/firebase');
      await saveSubmission(submission);
      router.push(`/result/${submission.id}`);
    } catch (err) {
      setError((err as Error).message || 'Error inesperat');
      setGenerating(false);
    }
  };

  if (generating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6" style={{ background: 'var(--bg)' }}>
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: 'var(--border)' }} />
          <div className="absolute inset-0 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--heading)', borderTopColor: 'transparent' }} />
          <div className="absolute inset-4 rounded-full flex items-center justify-center text-2xl" style={{ background: '#f7f4f7' }}>✨</div>
        </div>
        <h2 className="text-2xl font-black mb-3" style={{ color: 'var(--heading)' }}>Generant el teu recurs...</h2>
        <p className="max-w-sm mb-8" style={{ color: 'var(--muted)' }}>
          Gemini està creant la webapp educativa a partir del teu prompt.
        </p>
        {/* Show the assembled prompt */}
        <div className="max-w-lg w-full rounded-2xl p-5 text-left" style={{ background: '#f7f4f7', border: '1px solid var(--border)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--heading)' }}>El prompt enviat</div>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--body)' }}>
            Crea una eina educativa per a {promptPreview}.{extraContext ? ` ${extraContext}` : ''} Format: {formatLabel}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-20 bg-white" style={{ borderColor: 'var(--border)' }}>
        <button onClick={() => router.push('/warmup')} className="text-sm" style={{ color: 'var(--muted)' }}>
          ← Warm-up
        </button>
        <span className="font-black" style={{ color: 'var(--heading)' }}>Vibe Coding</span>
        <div className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
          {completedGroups}/{GROUPS.length} targetes
        </div>
      </header>

      {/* Live prompt preview bar */}
      <div className="sticky top-[57px] z-10 px-6 py-3 border-b" style={{ background: '#f7f4f7', borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--heading)' }}>
            📝 Prompt en construcció
          </div>
          <p className="text-sm leading-relaxed" style={{ color: completedGroups > 0 ? 'var(--body)' : 'var(--muted)' }}>
            Crea una eina educativa per a{' '}
            {GROUPS.map((g, i) => {
              const val = selections[g.id];
              return (
                <span key={g.id}>
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={val
                      ? { background: g.bg, color: g.color, border: `1px solid ${g.color}40` }
                      : { background: '#ede8ed', color: 'var(--muted)' }
                    }
                  >
                    {val ? `${g.emoji} ${g.fragment(val)}` : `[${g.label}]`}
                  </span>
                  {i < GROUPS.length - 1 && <span style={{ color: 'var(--muted)' }}>, </span>}
                </span>
              );
            })}
            .
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full px-6 py-6 flex flex-col gap-8">

        {/* Pair name */}
        <div>
          <input
            placeholder="Nom de la parella (opcional)"
            value={pairName}
            onChange={e => setPairName(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
            style={{ background: '#f7f4f7', border: '1.5px solid var(--border)', color: 'var(--body)' }}
          />
        </div>

        {/* 5 Card groups */}
        {GROUPS.map(g => (
          <section key={g.id}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{g.emoji}</span>
              <div>
                <h2 className="font-black text-base" style={{ color: g.color }}>{g.label}</h2>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>{g.question}</p>
              </div>
              {selections[g.id] && (
                <span className="ml-auto text-xs font-bold px-2 py-1 rounded-full" style={{ background: g.bg, color: g.color }}>
                  ✓ {g.cards.find(c => c.value === selections[g.id])?.label}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {g.cards.map(card => (
                <button
                  key={card.value}
                  type="button"
                  onClick={() => setSelections(s => ({ ...s, [g.id]: card.value }))}
                  className="flex items-center gap-3 rounded-xl p-4 text-left transition-all"
                  style={selections[g.id] === card.value
                    ? { background: g.bg, border: `2px solid ${g.color}`, color: g.color }
                    : { background: '#faf8fa', border: '1.5px solid var(--border)', color: 'var(--body)' }
                  }
                >
                  <span className="text-2xl">{card.emoji}</span>
                  <span className="text-sm font-medium leading-tight">{card.label}</span>
                </button>
              ))}
            </div>
          </section>
        ))}

        {/* Extra context + voice */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🎤</span>
            <div>
              <h2 className="font-black text-base" style={{ color: 'var(--heading)' }}>Context addicional</h2>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Afegeix detalls per micròfon o escrivint (opcional)</p>
            </div>
          </div>
          <div className="relative">
            <textarea
              placeholder="Ex: Els alumnes tenen 9 anys i treballem la taula del 7. Vull que sigui molt visual..."
              value={extraContext}
              onChange={e => setExtraContext(e.target.value)}
              rows={3}
              className="w-full rounded-xl px-4 py-3 pr-14 text-sm focus:outline-none resize-none"
              style={{ background: '#f7f4f7', border: '1.5px solid var(--border)', color: 'var(--body)' }}
            />
            <button
              type="button"
              onClick={listening ? stopVoice : startVoice}
              className="absolute right-3 bottom-3 w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all"
              style={listening
                ? { background: 'var(--accent)', color: 'white' }
                : { background: 'white', border: '1.5px solid var(--border)' }
              }
              title={listening ? 'Atura el micròfon' : 'Dictar amb veu'}
            >
              🎤
            </button>
          </div>
          {listening && (
            <p className="text-xs mt-1 animate-pulse" style={{ color: 'var(--accent)' }}>🔴 Escoltant...</p>
          )}
        </section>

        {/* Format */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">✨</span>
            <div>
              <h2 className="font-black text-base" style={{ color: 'var(--heading)' }}>Format de sortida</h2>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Com ha de ser la webapp generada?</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FORMAT_OPTIONS.map(f => (
              <button
                key={f.value}
                type="button"
                onClick={() => { setFormat(f.value); setFormatLabel(f.label); }}
                className="flex items-start gap-3 rounded-xl p-4 text-left transition-all"
                style={format === f.value
                  ? { background: '#f0eaf5', border: '2px solid var(--heading)' }
                  : { background: '#faf8fa', border: '1.5px solid var(--border)' }
                }
              >
                <span className="text-2xl">{f.emoji}</span>
                <div>
                  <div className="font-bold text-sm" style={{ color: 'var(--heading)' }}>{f.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{f.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl text-sm" style={{ background: '#fff0ee', border: '1px solid #f0c0b8', color: 'var(--accent)' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Generate button */}
        <div className="pb-8">
          <button
            type="button"
            onClick={generate}
            disabled={!canGenerate}
            className="w-full rounded-2xl py-5 text-lg font-bold transition-all"
            style={canGenerate
              ? { background: 'var(--heading)', color: 'white' }
              : { background: '#f0eaf0', color: 'var(--muted)', cursor: 'not-allowed' }
            }
          >
            {canGenerate ? '✨ Generar webapp educativa' : `Selecciona les ${GROUPS.length - completedGroups} targetes restants i el format`}
          </button>
        </div>

      </div>
    </main>
  );
}
