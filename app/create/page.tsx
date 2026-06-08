'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Submission } from '@/lib/types';
import { PhaseTimer } from '@/components/PhaseTimer';

// ── Card definitions ───────────────────────────────────────────────────────────

const EIXOS = [
  { value: 'Benestar social', emoji: '🤝' },
  { value: 'Educació mediàtica', emoji: '📱' },
  { value: 'Consciència social', emoji: '🌍' },
  { value: 'Art i creativitat', emoji: '🎨' },
  { value: 'Equitat i inclusió', emoji: '🌈' },
  { value: 'Cultura i diversitat', emoji: '🏛️' },
];

const USUARIS = [
  { value: 'Docent', emoji: '👨‍🏫' },
  { value: 'Alumnat', emoji: '👧' },
  { value: 'Famílies', emoji: '👨‍👩‍👧' },
  { value: 'Equip del centre', emoji: '🏫' },
];

const REPTES_PER_USUARI: Record<string, { value: string; emoji: string }[]> = {
  'Docent': [
    { value: 'Gestió d\'aula', emoji: '📋' },
    { value: 'Organització del temps', emoji: '⏰' },
    { value: 'Comunicació amb famílies', emoji: '📨' },
    { value: 'Seguiment de l\'alumnat', emoji: '📊' },
    { value: 'Preparació de classes', emoji: '📝' },
    { value: 'Avaluació', emoji: '✅' },
    { value: 'Benestar del grup', emoji: '💚' },
    { value: 'Inclusió i accessibilitat', emoji: '♿' },
  ],
  'Alumnat': [
    { value: 'Practicar un contingut', emoji: '🔁' },
    { value: 'Visualitzar un fenomen', emoji: '🔬' },
    { value: 'Autoavaluar-se', emoji: '🪞' },
    { value: 'Regular emocions', emoji: '🧘' },
    { value: 'Col·laborar en grup', emoji: '🤝' },
    { value: 'Explorar un concepte', emoji: '💡' },
    { value: 'Jugar per aprendre', emoji: '🎮' },
  ],
  'Famílies': [
    { value: 'Rebre informació', emoji: '📩' },
    { value: 'Omplir formularis', emoji: '📋' },
    { value: 'Preparar entrevistes', emoji: '🗣️' },
    { value: 'Comprendre rutines', emoji: '🗓️' },
    { value: 'Acompanyar el benestar', emoji: '💙' },
  ],
  'Equip del centre': [
    { value: 'Recollir dades', emoji: '📊' },
    { value: 'Organitzar torns', emoji: '🔄' },
    { value: 'Visualitzar informació', emoji: '📈' },
    { value: 'Coordinar equips', emoji: '🔗' },
    { value: 'Planificar activitats', emoji: '🗓️' },
  ],
};

const ACCIONS = [
  { value: 'Generar grups', emoji: '👥' },
  { value: 'Crear horaris', emoji: '📅' },
  { value: 'Recollir dades', emoji: '📊' },
  { value: 'Mostrar un checklist', emoji: '✅' },
  { value: 'Enviar un missatge', emoji: '📨' },
  { value: 'Visualitzar informació', emoji: '📈' },
  { value: 'Simular un fenomen', emoji: '⚗️' },
  { value: 'Crear un formulari', emoji: '📝' },
  { value: 'Generar retroalimentació', emoji: '💬' },
  { value: 'Organitzar torns', emoji: '🔄' },
  { value: 'Crear un mini-joc', emoji: '🎮' },
  { value: 'Comparar opcions', emoji: '⚖️' },
];

const ESTILS = [
  { value: 'Minimalista', emoji: '⬜' },
  { value: 'Alt contrast', emoji: '◼' },
  { value: 'Infantil', emoji: '🎈' },
  { value: 'Científic', emoji: '🔬' },
  { value: 'Mode pissarra', emoji: '🖊️' },
  { value: 'Colors suaus', emoji: '🎨' },
  { value: 'Tipografia gran', emoji: '🔠' },
  { value: 'Amb animacions', emoji: '✨' },
  { value: 'Amb dibuixos', emoji: '🖼️' },
  { value: 'Interactiva / gamificada', emoji: '🕹️' },
  { value: 'Estil fitxa / sobri', emoji: '📄' },
];

// Groups metadata for the prompt preview bar
const GROUPS = [
  { id: 'eix', label: 'Eix', color: '#0d9488', bg: '#f0fdfb', emoji: '🎯' },
  { id: 'usuari', label: 'Usuari', color: '#7c3aed', bg: '#f5f3ff', emoji: '👤' },
  { id: 'repte', label: 'Repte', color: '#ea580c', bg: '#fff7ed', emoji: '💡' },
  { id: 'accio', label: 'Acció', color: '#2563eb', bg: '#eff6ff', emoji: '⚡' },
  { id: 'estil', label: 'Estil', color: '#be185d', bg: '#fdf2f8', emoji: '🎨' },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function CreatePage() {
  const router = useRouter();
  const [eix, setEix] = useState('');
  const [usuari, setUsuari] = useState('');
  const [repte, setRepte] = useState('');
  const [accio, setAccio] = useState('');
  const [estil, setEstil] = useState('');
  const [extraContext, setExtraContext] = useState('');
  const [voicePrompt, setVoicePrompt] = useState('');
  const [listening, setListening] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const selections = { eix, usuari, repte, accio, estil };
  const completedGroups = GROUPS.filter(g => selections[g.id as keyof typeof selections]).length;
  const canGenerate = completedGroups === GROUPS.length || voicePrompt.trim().length > 5;

  const handleUsuari = (val: string) => { setUsuari(val); setRepte(''); };
  const currentReptes = usuari ? REPTES_PER_USUARI[usuari] ?? [] : [];

  const startVoice = useCallback((onResult: (t: string) => void) => {
    if (listening) { recognitionRef.current?.stop(); return; }
    const SR = (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'ca-ES';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: SpeechRecognitionEvent) => onResult(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  }, [listening]);

  const generate = async () => {
    setGenerating(true);
    setError('');
    try {
      const usingVoice = voicePrompt.trim().length > 5 && completedGroups < GROUPS.length;
      const selectedCards = [
        { group: 'Eix', value: eix },
        { group: 'Usuari final', value: usuari },
        { group: 'Acció principal', value: accio },
        { group: 'Repte', value: repte },
        { group: 'Estil', value: estil },
      ];
      const promptPreview = usingVoice ? voicePrompt : `${eix} · ${usuari} · ${accio} · ${repte} · ${estil}`;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedCards: usingVoice ? [] : selectedCards,
          promptPreview,
          voicePrompt: usingVoice ? voicePrompt : '',
          extraContext,
          format: accio.toLowerCase().replace(/\s/g, '_') || 'activitat',
          formatLabel: accio || 'Recurs educatiu',
          sessionId: process.env.NEXT_PUBLIC_SESSION_ID ?? 'mschools-2026',
        }),
      });
      if (!res.ok) {
        if (res.status === 504 || res.status === 524) throw new Error('La generació ha trigat massa. Torna-ho a intentar.');
        const errData = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(errData.error || `Error ${res.status} — torna-ho a intentar`);
      }
      const { submission } = await res.json() as { submission: Submission };
      const { saveSubmission } = await import('@/lib/firebase');
      await saveSubmission(submission);
      router.push(`/result/${submission.id}`);
    } catch (err) {
      setError((err as Error).message || 'Error inesperat');
      setGenerating(false);
    }
  };

  // ── Generating screen ────────────────────────────────────────────────────────
  if (generating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-lg flex flex-col items-center">
          {/* Spinner */}
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: 'var(--border)' }} />
            <div className="absolute inset-0 rounded-full border-4 animate-spin" style={{ borderColor: 'var(--heading)', borderTopColor: 'transparent' }} />
            <div className="absolute inset-3 rounded-full flex items-center justify-center text-xl" style={{ background: '#f7f4f7' }}>✨</div>
          </div>
          <h2 className="text-2xl font-black mb-2 text-center" style={{ color: 'var(--heading)' }}>Generant el teu recurs...</h2>
          <p className="text-sm mb-8 text-center" style={{ color: 'var(--muted)' }}>Gemini està creant la webapp educativa.</p>

          {/* Full sentence prompt */}
          <div className="w-full rounded-2xl p-5 mb-4" style={{ background: '#f7f4f7', border: '1px solid var(--border)' }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--muted)' }}>El teu prompt</div>
            {voicePrompt ? (
              <p className="text-sm italic" style={{ color: 'var(--body)' }}>&ldquo;{voicePrompt}&rdquo;</p>
            ) : (
              <p className="text-sm leading-[2.2]" style={{ color: 'var(--body)' }}>
                &ldquo;Crea una aplicació web emmarcada dins l&apos;eix de{' '}
                <PromptBadge value={eix} placeholder="EIX" color="#0d9488" bg="#f0fdfb" emoji="🎯" />,{' '}
                pensada perquè la faci servir{' '}
                <PromptBadge value={usuari} placeholder="USUARI FINAL" color="#7c3aed" bg="#f5f3ff" emoji="👤" />,{' '}
                a través de{' '}
                <PromptBadge value={accio} placeholder="ACCIÓ PRINCIPAL" color="#2563eb" bg="#eff6ff" emoji="⚡" />{' '}
                que serveixi per a{' '}
                <PromptBadge value={repte} placeholder="REPTE" color="#ea580c" bg="#fff7ed" emoji="💡" />,{' '}
                amb un estil{' '}
                <PromptBadge value={estil} placeholder="ESTIL" color="#be185d" bg="#fdf2f8" emoji="🎨" />,{' '}
                que sigui coherent i fàcil d&apos;usar.&rdquo;
              </p>
            )}
            {extraContext && (
              <p className="mt-3 text-sm border-t pt-3" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>
                + {extraContext}
              </p>
            )}
          </div>

          {/* Extra context editable while waiting */}
          <div className="w-full rounded-2xl p-4" style={{ background: 'white', border: '1px solid var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>Afegir al prompt (opcional)</p>
            <textarea
              placeholder="Mentre esperes, pots afegir més context per a la pròxima iteració..."
              value={extraContext}
              onChange={e => setExtraContext(e.target.value)}
              rows={2}
              className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none resize-none"
              style={{ background: '#f7f4f7', border: '1px solid var(--border)', color: 'var(--body)' }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-20 bg-white" style={{ borderColor: 'var(--border)' }}>
        <button onClick={() => router.push('/warmup')} className="text-sm" style={{ color: 'var(--muted)' }}>← Warm-up</button>
        <span className="font-black" style={{ color: 'var(--heading)' }}>Vibe Coding</span>
        <span className="text-xs font-mono px-2 py-1 rounded-full" style={{ background: '#f7f4f7', color: 'var(--muted)' }}>
          {completedGroups}/{GROUPS.length}
        </span>
      </header>

      {/* Phase timer */}
      <PhaseTimer
        phase={2}
        label="Construeix el prompt"
        defaultMinutes={8}
        instruction="Selecciona les 5 targetes i descriu el teu repte educatiu"
        color="#7c3aed"
        bg="#f5f3ff"
      />

      {/* Live prompt preview */}
      <div className="sticky top-[57px] z-10 px-6 py-4 border-b" style={{ background: '#f7f4f7', borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Prompt en construcció</p>
            <button
              type="button"
              onClick={() => startVoice(t => setVoicePrompt(prev => prev ? prev + ' ' + t : t))}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={listening
                ? { background: 'var(--accent)', color: 'white' }
                : { background: 'white', border: '1.5px solid var(--border)', color: 'var(--heading)' }
              }
            >
              🎤 {listening ? 'Escoltant...' : 'Dictar prompt'}
            </button>
          </div>
          {voicePrompt ? (
            <div className="flex items-start gap-2">
              <p className="flex-1 text-sm italic rounded-xl px-3 py-2" style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--body)' }}>
                &ldquo;{voicePrompt}&rdquo;
              </p>
              <button type="button" onClick={() => setVoicePrompt('')} className="text-xs mt-2" style={{ color: 'var(--muted)' }}>✕</button>
            </div>
          ) : (
            <p className="text-sm leading-[2.2]" style={{ color: 'var(--body)' }}>
              &ldquo;Crea una aplicació web emmarcada dins l&apos;eix de{' '}
              <PromptBadge value={eix} placeholder="EIX" color="#0d9488" bg="#f0fdfb" emoji="🎯" />,{' '}
              pensada perquè la faci servir{' '}
              <PromptBadge value={usuari} placeholder="USUARI FINAL" color="#7c3aed" bg="#f5f3ff" emoji="👤" />,{' '}
              a través de{' '}
              <PromptBadge value={accio} placeholder="ACCIÓ PRINCIPAL" color="#2563eb" bg="#eff6ff" emoji="⚡" />{' '}
              que serveixi per a{' '}
              <PromptBadge value={repte} placeholder="REPTE" color="#ea580c" bg="#fff7ed" emoji="💡" />,{' '}
              amb un estil{' '}
              <PromptBadge value={estil} placeholder="ESTIL" color="#be185d" bg="#fdf2f8" emoji="🎨" />,{' '}
              que sigui coherent i fàcil d&apos;usar.&rdquo;
            </p>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full px-6 py-6 flex flex-col gap-10">

        {/* 1. Eixos */}
        <CardGroup
          number="1" label="Eix" color="#0d9488" bg="#f0fdfb" emoji="🎯"
          description="Des de quin marc volem emmarcar l'app. L'eix dona sentit, valors i enfocament."
          selected={eix}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {EIXOS.map(c => (
              <Card key={c.value} card={c} selected={eix === c.value} color="#0d9488" bg="#f0fdfb" onClick={() => setEix(c.value)} />
            ))}
          </div>
        </CardGroup>

        {/* 2. Usuari final */}
        <CardGroup
          number="2" label="Usuari final" color="#7c3aed" bg="#f5f3ff" emoji="👤"
          description="Qui interactuarà amb l'app. Canvia completament el to, la interfície i la complexitat."
          selected={usuari}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {USUARIS.map(c => (
              <Card key={c.value} card={c} selected={usuari === c.value} color="#7c3aed" bg="#f5f3ff" onClick={() => handleUsuari(c.value)} />
            ))}
          </div>
        </CardGroup>

        {/* 3. Acció principal */}
        <CardGroup
          number="3" label="Acció principal" color="#2563eb" bg="#eff6ff" emoji="⚡"
          description="Què fa l'app. La funció clau que converteix el repte en una solució concreta."
          selected={accio}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ACCIONS.map(c => (
              <Card key={c.value} card={c} selected={accio === c.value} color="#2563eb" bg="#eff6ff" onClick={() => setAccio(c.value)} />
            ))}
          </div>
        </CardGroup>

        {/* 4. Repte — dynamic based on usuari */}
        <CardGroup
          number="4" label="Repte" color="#ea580c" bg="#fff7ed" emoji="💡"
          description={usuari ? `Necessitat concreta del/la ${usuari.toLowerCase()} dins d'aquest eix.` : 'Primer selecciona l\'usuari final per veure els reptes disponibles.'}
          selected={repte}
        >
          {!usuari ? (
            <div className="rounded-xl p-6 text-center text-sm" style={{ background: '#fff7ed', border: '1.5px dashed #ea580c50', color: '#ea580c' }}>
              👆 Selecciona primer l&apos;usuari final
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {currentReptes.map(c => (
                <Card key={c.value} card={c} selected={repte === c.value} color="#ea580c" bg="#fff7ed" onClick={() => setRepte(c.value)} />
              ))}
            </div>
          )}
        </CardGroup>

        {/* 5. Estil */}
        <CardGroup
          number="5" label="Estil" color="#be185d" bg="#fdf2f8" emoji="🎨"
          description="Com ha de semblar i sentir-se l'app (look & feel + nivell d'interactivitat)."
          selected={estil}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ESTILS.map(c => (
              <Card key={c.value} card={c} selected={estil === c.value} color="#be185d" bg="#fdf2f8" onClick={() => setEstil(c.value)} />
            ))}
          </div>
        </CardGroup>

        {/* Voice / extra context */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🎤</span>
            <div>
              <h3 className="font-black text-base" style={{ color: 'var(--heading)' }}>Context addicional</h3>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>Afegeix detalls per micròfon o escrivint (opcional)</p>
            </div>
          </div>
          <div className="relative">
            <textarea
              placeholder="Ex: Els alumnes tenen 9 anys. Vull que sigui molt visual i que es pugui fer en 10 minuts..."
              value={extraContext}
              onChange={e => setExtraContext(e.target.value)}
              rows={3}
              className="w-full rounded-xl px-4 py-3 pr-14 text-sm focus:outline-none resize-none"
              style={{ background: '#f7f4f7', border: '1.5px solid var(--border)', color: 'var(--body)' }}
            />
            <button
              type="button"
              onClick={() => startVoice(t => setExtraContext(prev => prev ? prev + ' ' + t : t))}
              className="absolute right-3 bottom-3 w-10 h-10 rounded-full flex items-center justify-center text-xl"
              style={listening ? { background: 'var(--accent)', color: 'white' } : { background: 'white', border: '1.5px solid var(--border)' }}
            >🎤</button>
          </div>
          {listening && <p className="text-xs mt-1 animate-pulse" style={{ color: 'var(--accent)' }}>🔴 Escoltant...</p>}
        </section>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl text-sm" style={{ background: '#fff0ee', border: '1px solid #f0c0b8', color: 'var(--accent)' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Generate */}
        <div className="pb-10">
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
            {canGenerate
              ? '✨ Generar webapp educativa'
              : `Selecciona ${GROUPS.length - completedGroups} targeta${GROUPS.length - completedGroups !== 1 ? 'r' : ''} més`
            }
          </button>
        </div>

      </div>
    </main>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function PromptBadge({ value, placeholder, color, bg, emoji }: {
  value: string; placeholder: string; color: string; bg: string; emoji: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-bold align-middle"
      style={value
        ? { background: bg, color, border: `1.5px solid ${color}50` }
        : { background: '#e8e2e8', color: '#aaa', border: '1.5px solid #d8d0d8' }
      }
    >
      <span>{emoji}</span>
      {value || placeholder}
    </span>
  );
}

function CardGroup({ number, label, color, bg, emoji, description, selected, children }: {
  number: string; label: string; color: string; bg: string; emoji: string;
  description: string; selected: string; children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white" style={{ background: color }}>
          {number}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{emoji}</span>
            <h2 className="font-black text-base" style={{ color }}>{label}</h2>
            {selected && (
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: bg, color }}>
                ✓ {selected}
              </span>
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Card({ card, selected, color, bg, onClick }: {
  card: { value: string; emoji: string };
  selected: boolean; color: string; bg: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl p-3 text-left transition-all"
      style={selected
        ? { background: bg, border: `2px solid ${color}`, color }
        : { background: '#faf8fa', border: '1.5px solid var(--border)', color: 'var(--body)' }
      }
    >
      <span className="text-xl flex-shrink-0">{card.emoji}</span>
      <span className="text-sm font-medium leading-tight">{card.value}</span>
    </button>
  );
}
