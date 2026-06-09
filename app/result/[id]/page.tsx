'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { getSubmission, updateSubmission } from '@/lib/firebase';
import type { Submission } from '@/lib/types';
import { PhaseTimer } from '@/components/PhaseTimer';
import { MSchoolsLogo } from '@/components/MSchoolsLogo';

export default function ResultPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState('');

  // Refine
  const [refineText, setRefineText] = useState('');
  const [refining, setRefining] = useState(false);
  const [refineListening, setRefineListening] = useState(false);
  const [refineError, setRefineError] = useState('');
  const refineRecRef = useRef<SpeechRecognition | null>(null);

  // Group name (saved at end)
  const [groupName, setGroupName] = useState('');
  const [groupNameSaved, setGroupNameSaved] = useState(false);

  // Editable prompt
  const [editablePrompt, setEditablePrompt] = useState('');
  const [promptEdited, setPromptEdited] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

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

  const handleRegenerate = async () => {
    if (!submission || !editablePrompt.trim()) return;
    setRegenerating(true);
    setRefineError('');
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawPrompt: editablePrompt,
          promptPreview: submission.tasca,
          pairName: groupName || submission.pairName || '',
          sessionId: process.env.NEXT_PUBLIC_SESSION_ID ?? 'mschools-2026',
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(errData.error || 'Error regenerant');
      }
      const { submission: newSub } = await res.json() as { submission: Submission };
      const { saveSubmission } = await import('@/lib/firebase');
      await saveSubmission(newSub);
      router.push(`/result/${newSub.id}`);
    } catch (err) {
      setRefineError((err as Error).message || 'Error inesperat');
      setRegenerating(false);
    }
  };

  const saveGroupName = async () => {
    if (!submission) return;
    await updateSubmission(submission.id, { pairName: groupName });
    setSubmission(prev => prev ? { ...prev, pairName: groupName } : prev);
    setGroupNameSaved(true);
    setTimeout(() => setGroupNameSaved(false), 2500);
  };

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!id) return;
    getSubmission(id as string).then(s => {
      setSubmission(s);
      setLoading(false);
      if (s) {
        setGroupName(s.pairName ?? '');
        setEditablePrompt(s.prompt ?? '');
      }
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
        <div className="flex items-center gap-2"><MSchoolsLogo size="sm" /><span style={{ color: 'var(--border)', fontSize: 16 }}>·</span><span className="font-black text-sm" style={{ color: 'var(--heading)' }}>Vibe Coding</span></div>
        <button
          onClick={() => router.push('/create')}
          className="text-sm rounded-lg px-3 py-1.5 transition-all"
          style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          + Nou recurs
        </button>
      </header>

      {/* Phase timer — synced with facilitator */}
      <PhaseTimer pagePhase={3} />

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

          {/* Editable full prompt */}
          {editablePrompt && (
            <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ border: '1.5px solid var(--border)', background: '#f7f4f7' }}>
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>
                  Prompt enviat a Gemini
                </div>
                {promptEdited && (
                  <span className="text-xs font-medium" style={{ color: '#0d9488' }}>Editat ✓</span>
                )}
              </div>
              <textarea
                value={editablePrompt}
                onChange={e => { setEditablePrompt(e.target.value); setPromptEdited(true); }}
                rows={10}
                className="text-xs rounded-xl p-4 whitespace-pre-wrap leading-relaxed resize-y focus:outline-none"
                style={{ background: 'white', border: `1px solid ${promptEdited ? '#0d9488' : 'var(--border)'}`, color: 'var(--body)', fontFamily: 'monospace' }}
              />
              {promptEdited && (
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="rounded-xl py-2.5 text-sm font-bold transition-all"
                  style={regenerating
                    ? { background: '#e8e2e8', color: 'var(--muted)', cursor: 'not-allowed' }
                    : { background: '#0d9488', color: 'white' }
                  }
                >
                  {regenerating ? '⏳ Generant...' : '🔄 Regenerar amb aquest prompt'}
                </button>
              )}
            </div>
          )}
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

          {/* Pre-Prompt summary */}
          <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ border: '1.5px solid var(--border)', background: '#f7f4f7' }}>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Pre-Prompt</div>
            <PromptSentence tasca={submission.tasca} />
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

          {/* Group name — save at the end */}
          <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ border: '1.5px solid var(--border)', background: '#f7f4f7' }}>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>👥 Identificar el recurs</div>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Opcional. Afegiu el nom del vostre grup per identificar el recurs a la galeria.</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Grup 3, Equip B, Anna & Marc..."
                value={groupName}
                onChange={e => setGroupName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') saveGroupName(); }}
                className="flex-1 rounded-xl px-3 py-2 text-sm focus:outline-none"
                style={{ background: 'white', border: '1.5px solid var(--border)', color: 'var(--body)' }}
              />
              <button
                onClick={saveGroupName}
                className="rounded-xl px-3 py-2 text-sm font-bold transition-all flex-shrink-0"
                style={groupNameSaved
                  ? { background: '#f0fdfb', color: '#0d9488', border: '1.5px solid #0d9488' }
                  : { background: 'var(--heading)', color: 'white' }
                }
              >
                {groupNameSaved ? '✓' : 'Desar'}
              </button>
            </div>
          </div>

          {/* Ticket button */}
          <button
            onClick={() => router.push(`/ticket/${id}`)}
            className="rounded-2xl py-4 font-bold transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{ background: '#dc2626', color: 'white' }}
          >
            🎫 Imprimir tiquet del grup
          </button>

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
