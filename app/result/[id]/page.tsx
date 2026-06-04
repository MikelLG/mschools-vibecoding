'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { getSubmission, updateSubmission } from '@/lib/firebase';
import type { Submission } from '@/lib/types';

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState('');
  const [refineText, setRefineText] = useState('');
  const [refining, setRefining] = useState(false);
  const [refineListening, setRefineListening] = useState(false);
  const [refineError, setRefineError] = useState('');
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const refineRecRef = useRef<SpeechRecognition | null>(null);

  const startRefineVoice = useCallback(() => {
    if (refineListening) { refineRecRef.current?.stop(); return; }
    const SR = (window as unknown as { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = 'ca-ES';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const t = e.results[0][0].transcript;
      setRefineText(prev => prev ? prev + ' ' + t : t);
    };
    rec.onend = () => setRefineListening(false);
    rec.start();
    refineRecRef.current = rec;
    setRefineListening(true);
  }, [refineListening]);

  const handleRefine = async () => {
    if (!submission || !refineText.trim()) return;
    setRefining(true);
    setRefineError('');
    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ existingHtml: submission.htmlOutput, refinementText: refineText }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(errData.error || 'Error en la millora');
      }
      const { htmlOutput } = await res.json() as { htmlOutput: string };
      await updateSubmission(submission.id, { htmlOutput });
      setSubmission(prev => prev ? { ...prev, htmlOutput } : prev);
      setRefineText('');
    } catch (err) {
      setRefineError((err as Error).message || 'Error inesperat');
    } finally {
      setRefining(false);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--heading)' }} />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg)' }}>
        <p style={{ color: 'var(--muted)' }}>Recurs no trobat.</p>
        <button onClick={() => router.push('/')} style={{ color: 'var(--accent)' }} className="hover:underline">← Inici</button>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-20 bg-white" style={{ borderColor: 'var(--border)' }}>
        <button onClick={() => router.push('/')} className="text-sm transition-colors" style={{ color: 'var(--muted)' }}>
          ← Inici
        </button>
        <span className="font-black" style={{ color: 'var(--heading)' }}>Vibe Coding</span>
        <button
          onClick={() => router.push('/create')}
          className="text-sm rounded-lg px-3 py-1.5 transition-all"
          style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          + Nou recurs
        </button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-6 gap-6">
        {/* Left: Preview iframe */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {submission.rolLabel && (
              <span className="rounded-full px-3 py-1 text-xs" style={{ border: '1px solid var(--border)', background: '#f7f4f7', color: 'var(--muted)' }}>
                👩‍🏫 {submission.rolLabel}
              </span>
            )}
            {submission.formatLabel && (
              <span className="rounded-full px-3 py-1 text-xs" style={{ border: '1px solid var(--border)', background: '#f7f4f7', color: 'var(--muted)' }}>
                ✨ {submission.formatLabel}
              </span>
            )}
            {submission.pairName && (
              <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ border: '1px solid var(--accent)', background: '#fff0ee', color: 'var(--accent)' }}>
                {submission.pairName}
              </span>
            )}
          </div>

          {/* iframe preview */}
          <div className="relative rounded-2xl overflow-hidden" style={{ height: '520px', border: '1.5px solid var(--border)' }}>
            <div className="flex items-center px-3 gap-1.5 border-b" style={{ height: '32px', background: '#f7f4f7', borderColor: 'var(--border)' }}>
              <div className="w-3 h-3 rounded-full" style={{ background: '#e5e5e5' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#e5e5e5' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#e5e5e5' }} />
              <span className="ml-2 text-xs" style={{ color: 'var(--muted)' }}>webapp educativa generada per IA</span>
            </div>
            <iframe
              srcDoc={submission.htmlOutput}
              className="absolute left-0 right-0 bottom-0 w-full"
              style={{ top: '32px', height: 'calc(100% - 32px)' }}
              sandbox="allow-scripts allow-forms"
              title="Recurs educatiu generat"
            />
          </div>

          {/* Full screen button */}
          <a
            href={`/app/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm transition-all"
            style={{ border: '1.5px solid var(--border)', background: '#f7f4f7', color: 'var(--muted)' }}
          >
            ↗ Obrir en pantalla completa
          </a>
        </div>

        {/* Right: QR + info */}
        <div className="w-full lg:w-72 flex flex-col gap-4">
          {/* QR card */}
          <div className="rounded-2xl p-6 flex flex-col items-center gap-4" style={{ border: '1.5px solid var(--border)', background: '#f7f4f7' }}>
            <div className="text-sm font-bold" style={{ color: 'var(--heading)' }}>Accedeix al recurs</div>
            {appUrl && (
              <div className="bg-white p-3 rounded-xl" style={{ border: '1px solid var(--border)' }}>
                <QRCode value={appUrl} size={160} />
              </div>
            )}
            <div className="text-xs text-center break-all" style={{ color: 'var(--muted)' }}>{appUrl}</div>
          </div>

          {/* Prompt summary */}
          <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ border: '1.5px solid var(--border)', background: '#f7f4f7' }}>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>El prompt</div>
            <PromptSentence tasca={submission.tasca} />
            {submission.pairName && (
              <p className="text-xs pt-2 border-t" style={{ color: 'var(--muted)', borderColor: 'var(--border)' }}>
                👥 {submission.pairName}
              </p>
            )}
            {submission.prompt && (
              <div className="border-t pt-3" style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={() => setShowFullPrompt(v => !v)}
                  className="flex items-center gap-1.5 text-xs font-bold transition-colors"
                  style={{ color: 'var(--muted)' }}
                >
                  <span>{showFullPrompt ? '▲' : '▼'}</span>
                  {showFullPrompt ? 'Amagar prompt complet' : 'Veure prompt complet enviat a Gemini'}
                </button>
                {showFullPrompt && (
                  <pre
                    className="mt-3 text-xs rounded-xl p-3 overflow-x-auto whitespace-pre-wrap break-words leading-relaxed"
                    style={{ background: 'white', border: '1px solid var(--border)', color: 'var(--body)', fontFamily: 'monospace' }}
                  >
                    {submission.prompt}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Refine section */}
          <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ border: '1.5px solid var(--border)', background: '#f7f4f7' }}>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>✏️ Millorar el recurs</div>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Descriu els canvis i la IA modificarà l&apos;app mantenint el contingut existent.</p>
            <div className="relative">
              <textarea
                placeholder="Ex: Afegeix un temporitzador de 30s, canvia els colors a blau, afegeix 3 preguntes més..."
                value={refineText}
                onChange={e => setRefineText(e.target.value)}
                rows={3}
                className="w-full rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none resize-none"
                style={{ background: 'white', border: '1.5px solid var(--border)', color: 'var(--body)' }}
              />
              <button
                type="button"
                onClick={startRefineVoice}
                className="absolute right-2 bottom-2 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                style={refineListening
                  ? { background: 'var(--accent)', color: 'white' }
                  : { background: '#f7f4f7', border: '1px solid var(--border)', color: 'var(--muted)' }
                }
              >🎤</button>
            </div>
            {refineListening && <p className="text-xs animate-pulse" style={{ color: 'var(--accent)' }}>🔴 Escoltant...</p>}
            {refineError && <p className="text-xs" style={{ color: 'var(--accent)' }}>⚠️ {refineError}</p>}
            <button
              onClick={handleRefine}
              disabled={!refineText.trim() || refining}
              className="rounded-xl py-3 text-sm font-bold transition-all"
              style={refineText.trim() && !refining
                ? { background: 'var(--heading)', color: 'white' }
                : { background: '#e8e2e8', color: 'var(--muted)', cursor: 'not-allowed' }
              }
            >
              {refining ? '⏳ Millorant...' : '✨ Aplicar millores'}
            </button>
          </div>

          {/* New resource button */}
          <button
            onClick={() => router.push('/create')}
            className="rounded-2xl py-4 font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: 'var(--heading)', color: 'white' }}
          >
            ✨ Crear un altre recurs
          </button>

          {/* Gallery link */}
          <a
            href="/gallery"
            className="rounded-2xl py-3 text-center text-sm transition-all"
            style={{ border: '1.5px solid var(--border)', background: '#f7f4f7', color: 'var(--muted)' }}
          >
            🖼️ Veure la galeria completa
          </a>
        </div>
      </div>
    </main>
  );
}

function PromptSentence({ tasca }: { tasca: string }) {
  const parts = tasca.split(' · ');
  if (parts.length < 5) {
    return <p className="text-sm italic leading-relaxed" style={{ color: 'var(--muted)' }}>&ldquo;{tasca}&rdquo;</p>;
  }
  const [eix, usuari, accio, repte, estil] = parts;
  return (
    <p className="text-sm leading-[2.4]" style={{ color: 'var(--body)' }}>
      &ldquo;Crea una aplicació web emmarcada dins l&apos;eix de{' '}
      <Badge v={eix} color="#0d9488" bg="#f0fdfb" />,{' '}
      pensada perquè la faci servir{' '}
      <Badge v={usuari} color="#7c3aed" bg="#f5f3ff" />,{' '}
      a través de{' '}
      <Badge v={accio} color="#2563eb" bg="#eff6ff" />{' '}
      que serveixi per a{' '}
      <Badge v={repte} color="#ea580c" bg="#fff7ed" />,{' '}
      amb un estil{' '}
      <Badge v={estil} color="#be185d" bg="#fdf2f8" />,{' '}
      que sigui coherent i fàcil d&apos;usar.&rdquo;
    </p>
  );
}

function Badge({ v, color, bg }: { v: string; color: string; bg: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold align-middle"
      style={{ color, background: bg, border: `1.5px solid ${color}50` }}
    >
      {v}
    </span>
  );
}
