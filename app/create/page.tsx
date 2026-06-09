'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Submission } from '@/lib/types';
import { PhaseTimer } from '@/components/PhaseTimer';
import { MSchoolsLogo } from '@/components/MSchoolsLogo';

// ── Card definitions (kept for digital fallback) ───────────────────────────────

const EIXOS = [
  { value: 'Benestar social', emoji: '🤝' },
  { value: 'Educació mediàtica', emoji: '📱' },
  { value: 'Consciència social', emoji: '🌍' },
  { value: 'Art i creativitat', emoji: '🎨' },
  { value: 'Equitat i inclusió', emoji: '🌈' },
  { value: 'Cultura i diversitat', emoji: '🏛️' },
];

const USUARIS = [
  { value: 'Docents', emoji: '👨‍🏫' },
  { value: 'Alumnes', emoji: '👧' },
  { value: 'Famílies', emoji: '👨‍👩‍👧' },
];

const REPTES_PER_USUARI: Record<string, { value: string; emoji: string }[]> = {
  'Docents': [
    { value: 'Gestió d\'aula', emoji: '📋' },
    { value: 'Organització del temps', emoji: '⏰' },
    { value: 'Comunicació amb famílies', emoji: '📨' },
    { value: 'Seguiment de l\'alumnat', emoji: '📊' },
    { value: 'Planificació de situacions d\'aprenentatge', emoji: '📝' },
    { value: 'Avaluació', emoji: '✅' },
    { value: 'Inclusió i accessibilitat', emoji: '♿' },
  ],
  'Alumnes': [
    { value: 'Practicar un contingut', emoji: '🔁' },
    { value: 'Visualitzar un fenomen', emoji: '🔬' },
    { value: 'Autoavaluar-se', emoji: '🪞' },
    { value: 'Regular emocions', emoji: '🧘' },
    { value: 'Col·laborar en grup', emoji: '🤝' },
    { value: 'Explorar un concepte', emoji: '💡' },
    { value: 'Jugar per a aprendre', emoji: '🎮' },
  ],
  'Famílies': [
    { value: 'Rebre informació', emoji: '📩' },
    { value: 'Emplenar formularis', emoji: '📋' },
    { value: 'Preparar entrevistes', emoji: '🗣️' },
    { value: 'Comprendre rutines', emoji: '🗓️' },
    { value: 'Acompanyar benestar', emoji: '💙' },
    { value: 'Seguiment del procés d\'aprenentatge', emoji: '📈' },
    { value: 'Complementar l\'aprenentatge des de casa', emoji: '🏠' },
  ],
};

const ACCIONS = [
  { value: 'Generar grups', emoji: '👥' },
  { value: 'Crear horaris', emoji: '📅' },
  { value: 'Classificar informació', emoji: '🗂️' },
  { value: 'Recol·lectar dades i mostrar-los a l\'instant', emoji: '📊' },
  { value: 'Sugerencias automàtiques', emoji: '🤖' },
  { value: 'Comparar escenaris (abans/després, opció A/B)', emoji: '⚖️' },
  { value: 'Simular situacions (emocionals, socials, científiques...)', emoji: '🎭' },
  { value: 'Acompanyar una reflexió emocional', emoji: '🧘' },
  { value: 'Generar retroalimentació', emoji: '💬' },
  { value: 'Facilitar una activitat creativa', emoji: '🎨' },
  { value: 'Crear un mini-joc', emoji: '🎮' },
  { value: 'Ruletes, sortejos, targetes aleatòries', emoji: '🎲' },
];

const ESTILS = [
  { value: 'Minimalista', emoji: '⬜' },
  { value: 'Alt contrast', emoji: '◼' },
  { value: 'Infantil', emoji: '🎈' },
  { value: 'Científic', emoji: '🔬' },
  { value: 'Creatiu / artístic', emoji: '🎨' },
  { value: 'Ludificat', emoji: '🏆' },
  { value: 'Amb animacions', emoji: '✨' },
  { value: 'Interactiu (botons, sliders, arrossegar)', emoji: '👆' },
  { value: 'Narratiu (per passos)', emoji: '📖' },
];

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

  // Voice transcript — primary input
  const [voicePrompt, setVoicePrompt] = useState('');
  const [listening, setListening] = useState(false);
  const [extraContext, setExtraContext] = useState('');

  // Digital fallback
  const [showDigital, setShowDigital] = useState(false);
  const [eix, setEix] = useState('');
  const [usuari, setUsuari] = useState('');
  const [repte, setRepte] = useState('');
  const [accio, setAccio] = useState('');
  const [estil, setEstil] = useState('');

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [retryInfo, setRetryInfo] = useState<{ attempt: number; countdown: number } | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const digitalSelections = { eix, usuari, repte, accio, estil };
  const completedGroups = GROUPS.filter(g => digitalSelections[g.id as keyof typeof digitalSelections]).length;
  const usingDigital = showDigital && completedGroups === GROUPS.length;
  const canGenerate = voicePrompt.trim().length > 5 || usingDigital;

  const handleUsuari = (val: string) => { setUsuari(val); setRepte(''); };
  const currentReptes = usuari ? REPTES_PER_USUARI[usuari] ?? [] : [];

  const startListening = useCallback(() => {
    if (listening) { recognitionRef.current?.stop(); return; }
    const SR = (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'ca-ES';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: SpeechRecognitionEvent) => setVoicePrompt(e.results[0][0].transcript);
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  }, [listening]);

  const startExtraVoice = useCallback(() => {
    const SR = (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'ca-ES';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: SpeechRecognitionEvent) => setExtraContext(prev => prev ? prev + ' ' + e.results[0][0].transcript : e.results[0][0].transcript);
    rec.onend = () => {};
    rec.start();
  }, []);

  const generate = async () => {
    setGenerating(true);
    setError('');
    setRetryInfo(null);

    const MAX_RETRIES = 10;
    const RETRY_SECONDS = 10;

    const promptPreview = usingDigital
      ? `${eix} · ${usuari} · ${accio} · ${repte} · ${estil}`
      : voicePrompt;

    const payload = {
      selectedCards: usingDigital ? [
        { group: 'Eix', value: eix },
        { group: 'Usuari final', value: usuari },
        { group: 'Acció principal', value: accio },
        { group: 'Repte', value: repte },
        { group: 'Estil', value: estil },
      ] : [],
      promptPreview,
      voicePrompt: usingDigital ? '' : voicePrompt,
      extraContext,
      format: (usingDigital ? accio : '').toLowerCase().replace(/\s/g, '_') || 'activitat',
      formatLabel: (usingDigital ? accio : '') || 'Recurs educatiu',
      sessionId: process.env.NEXT_PUBLIC_SESSION_ID ?? 'mschools-2026',
    };

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          if (res.status === 504 || res.status === 524) throw new Error('OVERLOADED');
          const errData = await res.json().catch(() => ({})) as { error?: string };
          throw new Error(errData.error || `Error ${res.status}`);
        }
        const { submission } = await res.json() as { submission: Submission };
        const { saveSubmission } = await import('@/lib/firebase');
        await saveSubmission(submission);
        router.push(`/result/${submission.id}`);
        return;
      } catch (err) {
        const msg = (err as Error).message ?? '';
        const isOverloaded = msg === 'OVERLOADED' || msg.includes('OVERLOADED') || msg.includes('sobrecarregats');
        if (isOverloaded && attempt < MAX_RETRIES) {
          for (let cd = RETRY_SECONDS; cd >= 0; cd--) {
            setRetryInfo({ attempt, countdown: cd });
            if (cd > 0) await new Promise(r => setTimeout(r, 1000));
          }
          setRetryInfo(null);
          continue;
        }
        setError(isOverloaded
          ? 'Els servidors de Gemini estan sobrecarregats. Espera uns minuts i torna-ho a intentar.'
          : msg || 'Error inesperat');
        setGenerating(false);
        setRetryInfo(null);
        return;
      }
    }
  };

  // ── Generating screen ────────────────────────────────────────────────────────
  if (generating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-lg flex flex-col items-center">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: 'var(--border)' }} />
            <div className="absolute inset-0 rounded-full border-4 animate-spin"
              style={{ borderColor: retryInfo ? '#ea580c' : 'var(--heading)', borderTopColor: 'transparent' }} />
            <div className="absolute inset-3 rounded-full flex items-center justify-center text-xl" style={{ background: '#f7f4f7' }}>
              {retryInfo ? '⏳' : '✨'}
            </div>
          </div>
          {retryInfo ? (
            <>
              <h2 className="text-2xl font-black mb-2 text-center" style={{ color: '#ea580c' }}>Els models estan ocupats...</h2>
              <p className="text-sm mb-2 text-center" style={{ color: 'var(--muted)' }}>Tornant a intentar automàticament · Intent {retryInfo.attempt}</p>
              <div className="flex items-center gap-2 mb-8">
                <div className="h-2 rounded-full flex-1" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${((10 - retryInfo.countdown) / 10) * 100}%`, background: '#ea580c' }} />
                </div>
                <span className="text-sm font-mono font-bold tabular-nums w-8 text-right" style={{ color: '#ea580c' }}>{retryInfo.countdown}s</span>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-black mb-2 text-center" style={{ color: 'var(--heading)' }}>Generant el teu recurs...</h2>
              <p className="text-sm mb-8 text-center" style={{ color: 'var(--muted)' }}>Gemini està creant la webapp educativa.</p>
            </>
          )}
          <div className="w-full rounded-2xl p-5" style={{ background: '#f7f4f7', border: '1px solid var(--border)' }}>
            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>El teu prompt</div>
            <p className="text-sm italic leading-relaxed" style={{ color: 'var(--body)' }}>&ldquo;{voicePrompt || promptPreviewText(eix, usuari, accio, repte, estil)}&rdquo;</p>
            {extraContext && <p className="mt-2 text-sm border-t pt-2" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>+ {extraContext}</p>}
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
        <div className="flex items-center gap-2"><MSchoolsLogo size="sm" /><span style={{ color: 'var(--border)', fontSize: 16 }}>·</span><span className="font-black text-sm" style={{ color: 'var(--heading)' }}>Vibe Coding</span></div>
        <div className="w-16" />
      </header>

      <PhaseTimer pagePhase={2} />

      <div className="max-w-2xl mx-auto w-full px-6 py-8 flex flex-col gap-8">

        {/* Pre-prompt template — what they need to read */}
        <div className="rounded-2xl p-6" style={{ background: '#f7f4f7', border: '1.5px solid var(--border)' }}>
          <div className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--muted)' }}>Llegeix aquest prompt en veu alta</div>
          <p className="text-base leading-[2.6]" style={{ color: 'var(--body)' }}>
            &ldquo;Crea una aplicació web emmarcada dins l&apos;eix de{' '}
            <Blank label="EIX" color="#0d9488" bg="#f0fdfb" />,{' '}
            pensada perquè la faci servir{' '}
            <Blank label="USUARI" color="#7c3aed" bg="#f5f3ff" />,{' '}
            a través de{' '}
            <Blank label="ACCIÓ" color="#2563eb" bg="#eff6ff" />{' '}
            que serveixi per a{' '}
            <Blank label="REPTE" color="#ea580c" bg="#fff7ed" />,{' '}
            amb un estil{' '}
            <Blank label="ESTIL" color="#be185d" bg="#fdf2f8" />,{' '}
            que sigui coherent i fàcil d&apos;usar.&rdquo;
          </p>
        </div>

        {/* Voice input — primary action */}
        <div className="flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={startListening}
            className="w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1 text-white font-bold transition-all hover:scale-105 active:scale-95"
            style={{
              background: listening ? '#dc2626' : 'var(--heading)',
              boxShadow: listening ? '0 0 0 8px #dc262620' : '0 4px 24px rgba(94,36,64,0.25)',
            }}
          >
            <span className="text-3xl">{listening ? '⏹' : '🎤'}</span>
            <span className="text-xs">{listening ? 'Aturar' : 'Gravar'}</span>
          </button>

          {listening && (
            <p className="text-sm font-bold animate-pulse" style={{ color: '#dc2626' }}>
              🔴 Escoltant... llegeix el prompt
            </p>
          )}

          {voicePrompt && !listening && (
            <div className="w-full rounded-2xl p-4" style={{ background: 'white', border: '2px solid var(--heading)' }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--heading)' }}>✓ Transcripció</div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--body)' }}>&ldquo;{voicePrompt}&rdquo;</p>
                </div>
                <button type="button" onClick={() => setVoicePrompt('')} className="text-xs mt-1 flex-shrink-0" style={{ color: 'var(--muted)' }}>
                  ✕ Repetir
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Extra context */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-sm" style={{ color: 'var(--heading)' }}>Context addicional (opcional)</h3>
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
              onClick={startExtraVoice}
              className="absolute right-3 bottom-3 w-10 h-10 rounded-full flex items-center justify-center text-xl"
              style={{ background: 'white', border: '1.5px solid var(--border)' }}
            >🎤</button>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-xl text-sm" style={{ background: '#fff0ee', border: '1px solid #f0c0b8', color: 'var(--accent)' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Generate */}
        <div className="flex flex-col gap-3 pb-6">
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
            {canGenerate ? '✨ Generar webapp educativa' : '🎤 Llegeix el prompt per continuar'}
          </button>

          {/* Hidden digital fallback */}
          <button
            type="button"
            onClick={() => setShowDigital(v => !v)}
            className="text-xs text-center py-1"
            style={{ color: 'var(--border)' }}
          >
            {showDigital ? '▲ Amagar selecció digital' : '▾ Selecció digital (alternativa)'}
          </button>
        </div>

        {/* Digital card picker — hidden by default */}
        {showDigital && (
          <div className="flex flex-col gap-10 pb-10 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            <CardGroup number="1" label="Eix" color="#0d9488" bg="#f0fdfb" emoji="🎯"
              description="Des de quin marc volem emmarcar l'app." selected={eix}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EIXOS.map(c => <Card key={c.value} card={c} selected={eix === c.value} color="#0d9488" bg="#f0fdfb" onClick={() => setEix(c.value)} />)}
              </div>
            </CardGroup>

            <CardGroup number="2" label="Usuari final" color="#7c3aed" bg="#f5f3ff" emoji="👤"
              description="Qui interactuarà amb l'app." selected={usuari}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {USUARIS.map(c => <Card key={c.value} card={c} selected={usuari === c.value} color="#7c3aed" bg="#f5f3ff" onClick={() => handleUsuari(c.value)} />)}
              </div>
            </CardGroup>

            <CardGroup number="3" label="Acció principal" color="#2563eb" bg="#eff6ff" emoji="⚡"
              description="Què fa l'app." selected={accio}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ACCIONS.map(c => <Card key={c.value} card={c} selected={accio === c.value} color="#2563eb" bg="#eff6ff" onClick={() => setAccio(c.value)} />)}
              </div>
            </CardGroup>

            <CardGroup number="4" label="Repte" color="#ea580c" bg="#fff7ed" emoji="💡"
              description={usuari ? `Necessitat del/la ${usuari.toLowerCase()}.` : "Primer selecciona l'usuari."} selected={repte}>
              {!usuari ? (
                <div className="rounded-xl p-6 text-center text-sm" style={{ background: '#fff7ed', border: '1.5px dashed #ea580c50', color: '#ea580c' }}>
                  👆 Selecciona primer l&apos;usuari final
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {currentReptes.map(c => <Card key={c.value} card={c} selected={repte === c.value} color="#ea580c" bg="#fff7ed" onClick={() => setRepte(c.value)} />)}
                </div>
              )}
            </CardGroup>

            <CardGroup number="5" label="Estil" color="#be185d" bg="#fdf2f8" emoji="🎨"
              description="Com ha de semblar i sentir-se l'app." selected={estil}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ESTILS.map(c => <Card key={c.value} card={c} selected={estil === c.value} color="#be185d" bg="#fdf2f8" onClick={() => setEstil(c.value)} />)}
              </div>
            </CardGroup>
          </div>
        )}

      </div>
    </main>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function promptPreviewText(eix: string, usuari: string, accio: string, repte: string, estil: string) {
  return `Crea una aplicació web emmarcada dins l'eix de ${eix}, pensada perquè la faci servir ${usuari}, a través de ${accio} que serveixi per a ${repte}, amb un estil ${estil}, que sigui coherent i fàcil d'usar.`;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Blank({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-black align-middle"
      style={{ background: bg, color, border: `2px solid ${color}40`, letterSpacing: 0.5 }}
    >
      {label}
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
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black text-white" style={{ background: color }}>{number}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{emoji}</span>
            <h2 className="font-black text-base" style={{ color }}>{label}</h2>
            {selected && <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: bg, color }}>✓ {selected}</span>}
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Card({ card, selected, color, bg, onClick }: {
  card: { value: string; emoji: string }; selected: boolean; color: string; bg: string; onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-2 rounded-xl p-3 text-left transition-all"
      style={selected ? { background: bg, border: `2px solid ${color}`, color } : { background: '#faf8fa', border: '1.5px solid var(--border)', color: 'var(--body)' }}
    >
      <span className="text-xl flex-shrink-0">{card.emoji}</span>
      <span className="text-sm font-medium leading-tight">{card.value}</span>
    </button>
  );
}
