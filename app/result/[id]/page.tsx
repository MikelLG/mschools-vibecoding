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
      const refinements = [...(submission.refinements ?? []), refineText.trim()];
      const refinementsBlock = '\n\n## MILLORES APLICADES\n' + refinements.map((r, i) => `${i + 1}. ${r}`).join('\n');
      const basePrompt = submission.prompt.replace(/\n\n## MILLORES APLICADES[\s\S]*$/, '');
      const updatedPrompt = basePrompt + refinementsBlock;
      await updateSubmission(submission.id, { htmlOutput, refinements, prompt: updatedPrompt });
      setSubmission(prev => prev ? { ...prev, htmlOutput, refinements, prompt: updatedPrompt } : prev);
      setEditablePrompt(updatedPrompt);
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

      <div className="flex" style={{ alignItems: 'flex-start' }}>

        {/* Left sticky sidebar — instructions */}
        <div className="flex flex-col px-6 py-6 gap-5" style={{ width: 280, minWidth: 260, flexShrink: 0, borderRight: '1.5px solid var(--border)', position: 'sticky', top: 40, maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>
          <div>
            <h1 className="text-xl font-black mb-1" style={{ color: 'var(--heading)' }}>Itera i millora</h1>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
              Revisa la webapp i ajusta-la fins que estigui llesta.
            </p>
          </div>
          <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: '#f0fdfb', border: '1.5px solid #0d948825' }}>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#0d9488' }}>Com funciona</div>
            <ol className="text-sm flex flex-col gap-2" style={{ color: 'var(--body)' }}>
              <li>1. Revisa la webapp generada. Pots accedir-hi a través del QR també.</li>
              <li>2. Edita el prompt o sol·licita una millora a la barra lateral.</li>
              <li>3. Posa nom al teu recurs i clica <strong>Finalitzar</strong>.</li>
            </ol>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col lg:flex-row p-6 gap-6">
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
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Prompt enviat a Gemini</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--muted)', opacity: 0.7 }}>Edita'l si és necessari per ajustar el resultat.</div>
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
            {submission.refinements && submission.refinements.length > 0 && (
              <div className="flex flex-col gap-1 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Millores aplicades</div>
                {submission.refinements.map((r, i) => (
                  <div key={i} className="text-xs flex items-start gap-1.5" style={{ color: 'var(--body)' }}>
                    <span style={{ color: 'var(--muted)' }}>{i + 1}.</span>
                    <span>{r}</span>
                  </div>
                ))}
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

          {/* Group name + Finalitzar */}
          <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ border: '2px solid var(--heading)', background: '#f7f4f7' }}>
            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--heading)' }}>👥 Nom del grup</div>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Poseu el nom del vostre grup per identificar el recurs.</p>
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
                  : { background: 'var(--border)', color: 'var(--muted)' }
                }
              >
                {groupNameSaved ? '✓' : 'Desar'}
              </button>
            </div>
            <button
              onClick={async () => { await saveGroupName(); router.push(`/ticket/${id}`); }}
              className="w-full rounded-xl py-3.5 text-base font-black transition-all hover:opacity-90 hover:scale-[1.01]"
              style={{ background: 'var(--heading)', color: 'white' }}
            >
              Finalitzar →
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
        </div> {/* end main content */}
      </div> {/* end outer flex */}
    </main>
  );
}

// ── Card value lists (for voice transcript parsing) ───────────────────────────
const _EIXOS    = ['Benestar social','Educació mediàtica','Consciència social','Art i creativitat','Equitat i inclusió','Cultura i diversitat'];
const _USUARIS  = ['Docents','Alumnes','Famílies'];
const _ACCIONS  = ['Generar grups','Crear horaris','Classificar informació','Recol·lectar dades i mostrar-los a l\'instant','Suggerències automàtiques','Comparar escenaris (abans/després, opció A/B)','Simular situacions (emocionals, socials, científiques...)','Acompanyar una reflexió emocional','Generar retroalimentació','Facilitar una activitat creativa','Crear un mini-joc','Ruletes, sortejos, targetes aleatòries'];
const _REPTES   = ['Gestió d\'aula','Organització del temps','Comunicació amb famílies','Seguiment de l\'alumnat','Planificació de situacions d\'aprenentatge','Avaluació','Inclusió i accessibilitat','Practicar un contingut','Visualitzar un fenomen','Autoavaluar-se','Regular emocions','Col·laborar en grup','Explorar un concepte','Jugar per a aprendre','Rebre informació','Emplenar formularis','Preparar entrevistes','Comprendre rutines','Acompanyar benestar','Seguiment del procés d\'aprenentatge','Complementar l\'aprenentatge des de casa'];
const _ESTILS   = ['Minimalista','Alt contrast','Infantil','Científic','Creatiu / artístic','Ludificat','Amb animacions','Interactiu (botons, sliders, arrossegar)','Narratiu (per passos)'];

const _STOP = new Set(['a','de','d','el','la','els','les','i','o','un','una','amb','per','que','en','al','del','hi','es','se']);
function _norm(s: string) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[·''`()[\],./]/g,' ').replace(/\s+/g,' ').trim(); }
function _kw(s: string) { return _norm(s).split(' ').filter(w => w.length > 2 && !_STOP.has(w)); }
function _best(cards: string[], t: string): string | undefined {
  let best: string | undefined; let top = 0.49;
  for (const c of cards) { const kw = _kw(c); if (!kw.length) continue; const sc = kw.filter(w => t.includes(w)).length / kw.length; if (sc > top) { top = sc; best = c; } }
  return best;
}
function _parse(text: string) {
  const t = _norm(text);
  return { eix: _best(_EIXOS,t), usuari: _best(_USUARIS,t), accio: _best(_ACCIONS,t), repte: _best(_REPTES,t), estil: _best(_ESTILS,t) };
}

function PromptSentence({ tasca }: { tasca: string }) {
  const parts = tasca.split(' · ');
  let eix: string, usuari: string, accio: string, repte: string, estil: string;
  if (parts.length >= 5) {
    [eix, usuari, accio, repte, estil] = parts;
  } else {
    const p = _parse(tasca);
    eix = p.eix ?? ''; usuari = p.usuari ?? ''; accio = p.accio ?? ''; repte = p.repte ?? ''; estil = p.estil ?? '';
  }
  if (!eix && !usuari && !accio && !repte && !estil) {
    return <p className="text-sm italic leading-relaxed" style={{ color: 'var(--muted)' }}>&ldquo;{tasca}&rdquo;</p>;
  }
  return (
    <p className="text-sm leading-[2.4]" style={{ color: 'var(--body)' }}>
      &ldquo;Crea una aplicació web emmarcada dins l&apos;eix de{' '}
      <Badge v={eix} label="EIX" color="#0d9488" bg="#f0fdfb" />,{' '}
      pensada perquè la faci servir{' '}
      <Badge v={usuari} label="USUARI" color="#7c3aed" bg="#f5f3ff" />,{' '}
      a través de{' '}
      <Badge v={accio} label="ACCIÓ" color="#2563eb" bg="#eff6ff" />{' '}
      que serveixi per a{' '}
      <Badge v={repte} label="REPTE" color="#ea580c" bg="#fff7ed" />,{' '}
      amb un estil{' '}
      <Badge v={estil} label="ESTIL" color="#be185d" bg="#fdf2f8" />,{' '}
      que sigui coherent i fàcil d&apos;usar.&rdquo;
    </p>
  );
}

function Badge({ v, label, color, bg }: { v: string; label: string; color: string; bg: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold align-middle"
      style={{ color, background: v ? bg : 'white', border: `1.5px solid ${v ? color : color + '50'}` }}
    >
      {v || label}
    </span>
  );
}
