'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ROL_OPTIONS, CONTEXT_THEMES, FORMAT_OPTIONS } from '@/lib/types';
import type { Submission } from '@/lib/types';

type Step = 'rol' | 'context' | 'tasca' | 'format' | 'generating';

const STEPS: Step[] = ['rol', 'context', 'tasca', 'format'];
const STEP_LABELS = { rol: 'ROL', context: 'CONTEXT', tasca: 'TASCA', format: 'FORMAT' };

export default function CreatePage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>('rol');
  const [rolValue, setRolValue] = useState('');
  const [rolLabel, setRolLabel] = useState('');
  const [contextTheme, setContextTheme] = useState('');
  const [contextThemeLabel, setContextThemeLabel] = useState('');
  const [contextDescription, setContextDescription] = useState('');
  const [tasca, setTasca] = useState('');
  const [format, setFormat] = useState('');
  const [formatLabel, setFormatLabel] = useState('');
  const [pairName, setPairName] = useState('');
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const currentStepIndex = STEPS.indexOf(step as Step);
  const progress = step === 'generating' ? 100 : ((currentStepIndex + 1) / STEPS.length) * 100;

  const startVoice = useCallback(() => {
    const SR = (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'ca-ES';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setTasca(prev => (prev ? prev + ' ' + transcript : transcript));
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

  const canAdvance = () => {
    if (step === 'rol') return !!rolValue;
    if (step === 'context') return !!contextTheme;
    if (step === 'tasca') return tasca.trim().length > 10;
    if (step === 'format') return !!format;
    return false;
  };

  const advance = () => {
    const idx = STEPS.indexOf(step as Step);
    if (idx < STEPS.length - 1) {
      setStep(STEPS[idx + 1]);
    } else {
      generate();
    }
  };

  const back = () => {
    const idx = STEPS.indexOf(step as Step);
    if (idx > 0) setStep(STEPS[idx - 1]);
    else router.push('/');
  };

  const generate = async () => {
    setStep('generating');
    setError('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rol: rolValue,
          rolLabel,
          contextTheme,
          contextThemeLabel,
          contextDescription,
          tasca,
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
      setStep('format');
    }
  };

  return (
    <main className="min-h-screen flex flex-col overflow-y-auto" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <button onClick={back} className="text-sm flex items-center gap-1 transition-colors" style={{ color: 'var(--muted)' }}>
          ← {step === 'rol' ? 'Inici' : STEP_LABELS[STEPS[STEPS.indexOf(step as Step) - 1] as keyof typeof STEP_LABELS]}
        </button>
        <span className="font-black tracking-tight" style={{ color: 'var(--heading)' }}>Vibe Coding</span>
        <div className="w-16" />
      </header>

      {/* Progress bar */}
      {step !== 'generating' && (
        <div className="h-1" style={{ background: 'var(--border)' }}>
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${progress}%`, background: 'var(--heading)' }}
          />
        </div>
      )}

      {/* Step indicator */}
      {step !== 'generating' && (
        <div className="flex justify-center gap-2 py-6">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all"
                style={
                  i <= currentStepIndex
                    ? { background: 'var(--heading)', color: 'white' }
                    : { background: '#f0eaf0', color: 'var(--muted)', border: '1px solid var(--border)' }
                }
              >
                {i < currentStepIndex ? '✓' : i + 1}
              </div>
              <span className="text-xs font-mono" style={{ color: i === currentStepIndex ? 'var(--heading)' : 'var(--muted)' }}>
                {STEP_LABELS[s as keyof typeof STEP_LABELS]}
              </span>
              {i < STEPS.length - 1 && <span className="mx-1" style={{ color: 'var(--border)' }}>—</span>}
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col items-center px-6 pb-8">
        {/* STEP: ROL */}
        {step === 'rol' && (
          <StepContainer
            title="Qui ets?"
            subtitle="Selecciona el teu perfil docent"
          >
            <div className="mb-6">
              <input
                placeholder="Nom de la parella (opcional)"
                value={pairName}
                onChange={e => setPairName(e.target.value)}
                className="w-full rounded-xl px-4 py-3 focus:outline-none transition-colors"
                style={{ background: '#f7f4f7', border: '1.5px solid var(--border)', color: 'var(--body)' }}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ROL_OPTIONS.map(opt => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => { setRolValue(opt.value); setRolLabel(opt.label); }}
                  className="flex flex-col items-center gap-2 rounded-2xl p-5 transition-all"
                  style={rolValue === opt.value
                    ? { background: '#f0eaf5', border: '2px solid var(--heading)', color: 'var(--heading)' }
                    : { background: '#faf8fa', border: '1.5px solid var(--border)', color: 'var(--body)' }
                  }
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <span className="text-sm font-medium text-center leading-tight">{opt.label}</span>
                </button>
              ))}
            </div>
          </StepContainer>
        )}

        {/* STEP: CONTEXT */}
        {step === 'context' && (
          <StepContainer
            title="Quin és el context?"
            subtitle="Tria el tema del teu repte educatiu"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {CONTEXT_THEMES.map(t => (
                <button
                  key={t.value}
                  onClick={() => { setContextTheme(t.value); setContextThemeLabel(t.label); }}
                  className="flex flex-col items-center gap-2 rounded-2xl p-5 transition-all"
                  style={contextTheme === t.value
                    ? { background: `${t.color}15`, border: `2px solid ${t.color}`, color: t.color }
                    : { background: '#faf8fa', border: '1.5px solid var(--border)', color: 'var(--body)' }
                  }
                >
                  <span className="text-3xl">{t.emoji}</span>
                  <span className="text-xs font-medium text-center leading-tight">{t.label}</span>
                </button>
              ))}
            </div>
            <textarea
              placeholder="Descriu breument la situació concreta (opcional)..."
              value={contextDescription}
              onChange={e => setContextDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl px-4 py-3 focus:outline-none transition-colors resize-none"
              style={{ background: '#f7f4f7', border: '1.5px solid var(--border)', color: 'var(--body)' }}
            />
          </StepContainer>
        )}

        {/* STEP: TASCA */}
        {step === 'tasca' && (
          <StepContainer
            title="Quin repte vols resoldre?"
            subtitle="Descriu el problema educatiu que tens"
          >
            <div className="relative">
              <textarea
                placeholder="Ex: Necessito una eina per ajudar els alumnes de 4t de primària a autoavaluar-se en les presentacions orals..."
                value={tasca}
                onChange={e => setTasca(e.target.value)}
                rows={6}
                className="w-full rounded-xl px-4 py-4 pr-14 focus:outline-none transition-colors resize-none"
                style={{ background: '#f7f4f7', border: '1.5px solid var(--border)', color: 'var(--body)' }}
              />
              <button
                onClick={listening ? stopVoice : startVoice}
                title={listening ? 'Atura la veu' : 'Dictar amb veu'}
                className="absolute right-3 bottom-3 w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all"
                style={listening
                  ? { background: 'var(--accent)', animation: 'pulse 1s infinite' }
                  : { background: 'white', border: '1.5px solid var(--border)' }
                }
              >
                🎤
              </button>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                {listening ? '🔴 Escoltant...' : 'Prem el micròfon per dictar'}
              </span>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                {tasca.length}/500
              </span>
            </div>
          </StepContainer>
        )}

        {/* STEP: FORMAT */}
        {step === 'format' && (
          <StepContainer
            title="Com ha de sortir?"
            subtitle="Tria el format del recurs que generarà la IA"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FORMAT_OPTIONS.map(f => (
                <button
                  key={f.value}
                  onClick={() => { setFormat(f.value); setFormatLabel(f.label); }}
                  className="flex items-start gap-4 rounded-2xl p-5 text-left transition-all"
                  style={format === f.value
                    ? { background: '#f0eaf5', border: '2px solid var(--heading)' }
                    : { background: '#faf8fa', border: '1.5px solid var(--border)' }
                  }
                >
                  <span className="text-3xl">{f.emoji}</span>
                  <div>
                    <div className="font-bold text-sm" style={{ color: 'var(--heading)' }}>{f.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{f.description}</div>
                  </div>
                </button>
              ))}
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl text-sm" style={{ background: '#fff0ee', border: '1px solid #f0c0b8', color: 'var(--accent)' }}>
                ⚠️ {error}
              </div>
            )}
          </StepContainer>
        )}

        {/* GENERATING */}
        {step === 'generating' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: 'var(--border)' }} />
              <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--heading)', borderTopColor: 'transparent' }} />
              <div className="absolute inset-4 rounded-full flex items-center justify-center text-3xl" style={{ background: '#f7f4f7' }}>
                ✨
              </div>
            </div>
            <h2 className="text-2xl font-black mb-3" style={{ color: 'var(--heading)' }}>Generant el teu recurs...</h2>
            <p className="max-w-sm" style={{ color: 'var(--muted)' }}>
              Gemini està creant una aplicació educativa personalitzada basada en les teves capes.
            </p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      {step !== 'generating' && (
        <div className="w-full max-w-2xl mx-auto px-6 py-6">
          <button
            onClick={advance}
            disabled={!canAdvance()}
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-lg font-bold transition-all"
            style={canAdvance()
              ? { background: 'var(--heading)', color: 'white' }
              : { background: '#f0eaf0', color: 'var(--muted)', cursor: 'not-allowed' }
            }
          >
            {step === 'format' ? (
              <>✨ Generar recurs</>
            ) : (
              <>Continuar → {step !== 'rol' && STEP_LABELS[STEPS[currentStepIndex + 1] as keyof typeof STEP_LABELS]}</>
            )}
          </button>
        </div>
      )}
    </main>
  );
}

function StepContainer({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--heading)' }}>{title}</h2>
        <p style={{ color: 'var(--muted)' }}>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
