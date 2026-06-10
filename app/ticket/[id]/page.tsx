'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { getSubmission, updateSubmission, addToPrintQueue } from '@/lib/firebase';
import type { Submission } from '@/lib/types';
import { PhaseTimer } from '@/components/PhaseTimer';
import { MSchoolsLogo } from '@/components/MSchoolsLogo';

export default function TicketPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [appUrl, setAppUrl] = useState('');
  const [groupName, setGroupName] = useState('');
  const [saved, setSaved] = useState(false);
  const [queued, setQueued] = useState(false);
  const [queueError, setQueueError] = useState('');

  useEffect(() => {
    getSubmission(id).then(s => {
      setSubmission(s);
      if (s?.pairName) setGroupName(s.pairName);
    });
    setAppUrl(`${window.location.origin}/app/${id}`);
  }, [id]);

  const sendToQueue = async () => {
    if (!submission) return;
    setQueueError('');
    const name = groupName.trim();
    try {
      if (name && name !== submission.pairName) {
        await updateSubmission(submission.id, { pairName: name });
        setSubmission(prev => prev ? { ...prev, pairName: name } : prev);
        setSaved(true);
      }
      await addToPrintQueue({
        submissionId: submission.id,
        sessionId: submission.sessionId ?? process.env.NEXT_PUBLIC_SESSION_ID ?? 'mschools-2026',
        pairName: name || submission.pairName || '',
        tasca: submission.tasca ?? '',
        formatLabel: submission.formatLabel ?? '',
        appUrl,
        createdAt: Date.now(),
        status: 'pending',
        retryCount: 0,
      });
      setQueued(true);
    } catch {
      setQueueError('No s\'ha pogut enviar. Comprova la connexió i torna-ho a intentar.');
    }
  };

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--heading)' }} />
      </div>
    );
  }

  const parts = submission.tasca?.split(' · ') ?? [];
  const hasCards = parts.length >= 5;
  const displayName = groupName.trim() || submission.pairName || '';

  return (
    <>
      <style>{`
        @media print {
          @page { size: 80mm auto; margin: 3mm 4mm; }
          body { background: white !important; margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .screen-only { display: none !important; }
          .thermal-print { display: block !important; }
        }
        @media screen {
          .thermal-print { display: none !important; }
        }
      `}</style>

      <main className="min-h-screen" style={{ background: '#f7f4f7' }}>

        {/* Header */}
        <div className="no-print">
          <header className="flex items-center justify-between px-6 py-4 border-b bg-white" style={{ borderColor: 'var(--border)' }}>
            <button onClick={() => router.push(`/result/${id}`)} className="text-sm" style={{ color: 'var(--muted)' }}>← Tornar</button>
            <div className="flex items-center gap-2">
              <MSchoolsLogo size="sm" />
              <span style={{ color: 'var(--border)', fontSize: 16 }}>·</span>
              <span className="font-black text-sm" style={{ color: 'var(--heading)' }}>Vibe Coding</span>
            </div>
            <div className="w-16" />
          </header>
          <PhaseTimer pagePhase={4} />
        </div>

        {/* ── Thermal receipt — only visible when printing ─────────────────── */}
        <div className="thermal-print" style={{ fontFamily: "'Arial', sans-serif", fontSize: 11, color: '#000', background: '#fff', width: '100%' }}>
          <div style={{ textAlign: 'center', padding: '6px 0 10px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, background: '#000', borderRadius: 3, color: '#fff', fontWeight: 900, fontSize: 13 }}>m</span>
              <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.5 }}>Schools</span>
            </div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase' }}>Vibe Coding · mSchools 2026</div>
          </div>
          <div style={{ borderTop: '3px solid #000', borderBottom: '1px solid #000', padding: '8px 0', textAlign: 'center', marginBottom: 10 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 2 }}>Grup</div>
            <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: 1 }}>{displayName || '—'}</div>
          </div>
          <div style={{ textAlign: 'center', margin: '0 0 6px' }}>
            {appUrl && <QRCode value={appUrl} size={210} style={{ maxWidth: '100%' }} />}
          </div>
          <div style={{ textAlign: 'center', fontSize: 8, marginBottom: 10, color: '#444', wordBreak: 'break-all', padding: '0 4px' }}>{appUrl}</div>
          <div style={{ borderTop: '3px solid #000', paddingTop: 8 }}>
            <div style={{ fontWeight: 800, fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 6 }}>El nostre recurs</div>
            {hasCards ? (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginBottom: 8 }}>
                  <tbody>
                    {[['Eix', parts[0]], ['Usuari', parts[1]], ['Acció', parts[2]], ['Repte', parts[3]], ['Estil', parts[4]]].map(([label, value]) => (
                      <tr key={label} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ fontWeight: 700, padding: '3px 8px 3px 0', width: 44, fontSize: 9, textTransform: 'uppercase', color: '#555' }}>{label}</td>
                        <td style={{ padding: '3px 0', fontWeight: 600, fontSize: 12 }}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ borderTop: '1px dashed #ccc', paddingTop: 6, fontSize: 9, lineHeight: 1.6, fontStyle: 'italic', color: '#333' }}>
                  &ldquo;Crea una aplicació web emmarcada dins l&apos;eix de <strong>{parts[0]}</strong>, pensada perquè la faci servir <strong>{parts[1]}</strong>, a través de <strong>{parts[2]}</strong> que serveixi per a <strong>{parts[3]}</strong>, amb un estil <strong>{parts[4]}</strong>, que sigui coherent i fàcil d&apos;usar.&rdquo;
                </div>
                {submission.refinements && submission.refinements.length > 0 && (
                  <div style={{ borderTop: '1px dashed #ccc', marginTop: 6, paddingTop: 6, fontSize: 9 }}>
                    <div style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Millores aplicades</div>
                    {submission.refinements.map((r, i) => (
                      <div key={i} style={{ lineHeight: 1.5 }}>{i + 1}. {r}</div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: 10, fontStyle: 'italic', lineHeight: 1.5 }}>{submission.tasca}</div>
            )}
          </div>
          <div style={{ borderTop: '3px solid #000', marginTop: 10, paddingTop: 6, textAlign: 'center' }}>
            <div style={{ fontSize: 9 }}>Escaneja el QR per obrir l&apos;eina</div>
            <div style={{ fontSize: 9, color: '#555' }}>{new Date(submission.createdAt).toLocaleDateString('ca-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
          </div>
        </div>

        {/* ── Screen view ──────────────────────────────────────────────────── */}
        <div className="screen-only flex" style={{ alignItems: 'flex-start' }}>

          {/* Left sidebar — instructions */}
          <div className="flex flex-col px-6 py-6 gap-5" style={{ width: 280, minWidth: 260, flexShrink: 0, borderRight: '1.5px solid var(--border)', position: 'sticky', top: 40, maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>
            <div>
              <h1 className="text-xl font-black mb-1" style={{ color: 'var(--heading)' }}>Publicació i tiquet</h1>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                Últim pas — identifica el recurs i imprimeix el tiquet físic.
              </p>
            </div>
            <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: '#f0fdfb', border: '1.5px solid #0d948825' }}>
              <div className="text-xs font-bold uppercase tracking-widest" style={{ color: '#0d9488' }}>Com funciona</div>
              <ol className="text-sm flex flex-col gap-2" style={{ color: 'var(--body)' }}>
                <li>1. Escriu el <strong>nom del vostre grup</strong> al camp.</li>
                <li>2. Prem <strong>Enviar a la impressora</strong> — el facilitador el rebrà i l&apos;imprimirà automàticament.</li>
                <li>3. <strong>Escaneja el QR</strong> del tiquet per accedir a la vostra webapp des de qualsevol dispositiu.</li>
              </ol>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex justify-center py-8">
          <div className="w-full px-6 flex flex-col gap-6" style={{ maxWidth: 560 }}>

          {/* Group name input */}
          <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ border: '2px solid var(--heading)', background: 'white' }}>
            <div className="text-sm font-bold" style={{ color: 'var(--heading)' }}>👥 Nom del grup</div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Grup 3, Equip B, Anna & Marc..."
                value={groupName}
                onChange={e => { setGroupName(e.target.value); setSaved(false); }}
                onKeyDown={e => { if (e.key === 'Enter') sendToQueue(); }}
                className="flex-1 rounded-xl px-4 py-3 text-base font-bold focus:outline-none"
                style={{ background: '#f7f4f7', border: '1.5px solid var(--border)', color: 'var(--heading)' }}
                autoFocus
              />
            </div>
            {!queued ? (
              <>
                <button
                  onClick={sendToQueue}
                  className="w-full rounded-xl py-4 text-lg font-black transition-all hover:opacity-90"
                  style={{ background: 'var(--heading)', color: 'white' }}
                >
                  🖨️ Enviar a la impressora
                </button>
                {queueError && <p className="text-xs text-center" style={{ color: '#dc2626' }}>⚠️ {queueError}</p>}
                {saved && <p className="text-xs text-center" style={{ color: '#0d9488' }}>✓ Nom desat</p>}
              </>
            ) : (
              <div className="rounded-xl py-4 text-center flex flex-col gap-1" style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0' }}>
                <span className="text-lg font-black" style={{ color: '#16a34a' }}>✓ Tiquet enviat!</span>
                <span className="text-xs" style={{ color: '#16a34a' }}>El facilitador l&apos;imprimirà en breus.</span>
              </div>
            )}
          </div>

          {/* Ticket preview */}
          <div className="rounded-3xl bg-white p-8" style={{ boxShadow: '0 4px 32px rgba(94,36,64,0.10)', border: '2px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <MSchoolsLogo size="md" />
                <div className="text-xs mt-1 font-semibold tracking-widest uppercase" style={{ color: 'var(--muted)' }}>Vibe Coding · mSchools 2026</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black" style={{ color: 'var(--heading)' }}>
                  {displayName || <span style={{ color: 'var(--border)' }}>Sense nom</span>}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  {new Date(submission.createdAt).toLocaleDateString('ca-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div className="flex gap-8 items-start">
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                {appUrl && <QRCode value={appUrl} size={160} />}
                <div className="text-xs text-center" style={{ color: 'var(--muted)', maxWidth: 160, wordBreak: 'break-all' }}>{appUrl}</div>
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--heading)' }}>El nostre recurs</div>
                {hasCards ? (
                  <>
                    <div className="flex flex-col gap-2 mb-3">
                      {[
                        { label: 'Eix', value: parts[0], color: '#0d9488', bg: '#f0fdfb' },
                        { label: 'Usuari', value: parts[1], color: '#7c3aed', bg: '#f5f3ff' },
                        { label: 'Acció', value: parts[2], color: '#2563eb', bg: '#eff6ff' },
                        { label: 'Repte', value: parts[3], color: '#ea580c', bg: '#fff7ed' },
                        { label: 'Estil', value: parts[4], color: '#be185d', bg: '#fdf2f8' },
                      ].map(({ label, value, color, bg }) => (
                        <div key={label} className="flex items-center gap-2">
                          <span className="text-xs font-bold w-12 flex-shrink-0" style={{ color: 'var(--muted)' }}>{label}</span>
                          <span className="text-sm font-semibold px-2.5 py-0.5 rounded-md" style={{ color, background: bg, border: `1.5px solid ${color}30` }}>{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-xs italic leading-relaxed" style={{ color: 'var(--muted)' }}>
                        &ldquo;Crea una aplicació web emmarcada dins l&apos;eix de <strong>{parts[0]}</strong>, pensada perquè la faci servir <strong>{parts[1]}</strong>, a través de <strong>{parts[2]}</strong> que serveixi per a <strong>{parts[3]}</strong>, amb un estil <strong>{parts[4]}</strong>, que sigui coherent i fàcil d&apos;usar.&rdquo;
                      </p>
                    </div>
                    {submission.refinements && submission.refinements.length > 0 && (
                      <div className="pt-3 border-t flex flex-col gap-1" style={{ borderColor: 'var(--border)' }}>
                        <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--muted)' }}>Millores aplicades</div>
                        {submission.refinements.map((r, i) => (
                          <div key={i} className="text-xs flex gap-1.5" style={{ color: 'var(--body)' }}>
                            <span style={{ color: 'var(--muted)' }}>{i + 1}.</span><span>{r}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm italic leading-relaxed" style={{ color: 'var(--body)' }}>&ldquo;{submission.tasca}&rdquo;</p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>Escaneja el codi QR per obrir l&apos;eina generada</div>
              <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>mschools-vibecoding.vercel.app</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => router.push(`/result/${id}`)} className="flex-1 rounded-xl py-3 text-sm font-bold transition-all"
              style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--muted)' }}>
              ← Tornar al resultat
            </button>
            <a href="/gallery" className="flex-1 rounded-xl py-3 text-sm font-bold text-center transition-all"
              style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--muted)' }}>
              🖼️ Veure la galeria
            </a>
          </div>

          </div> {/* end inner max-width */}
          </div> {/* end right centered wrapper */}
        </div> {/* end outer flex */}
      </main>
    </>
  );
}
