'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import QRCode from 'react-qr-code';
import { getSubmission } from '@/lib/firebase';
import type { Submission } from '@/lib/types';
import { PhaseTimer } from '@/components/PhaseTimer';
import { MSchoolsLogo } from '@/components/MSchoolsLogo';

export default function TicketPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [appUrl, setAppUrl] = useState('');

  useEffect(() => {
    getSubmission(id).then(setSubmission);
    setAppUrl(`${window.location.origin}/app/${id}`);
  }, [id]);

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--heading)' }} />
      </div>
    );
  }

  const parts = submission.tasca?.split(' · ') ?? [];
  const hasCards = parts.length >= 5;

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .ticket-card { box-shadow: none !important; border: 2px solid #ccc !important; }
        }
        @page { margin: 1cm; }
      `}</style>

      <main className="min-h-screen" style={{ background: '#f7f4f7' }}>

        {/* Header — hidden on print */}
        <div className="no-print">
          <header className="flex items-center justify-between px-6 py-4 border-b bg-white" style={{ borderColor: 'var(--border)' }}>
            <button onClick={() => router.back()} className="text-sm" style={{ color: 'var(--muted)' }}>← Enrere</button>
            <div className="flex items-center gap-2">
              <MSchoolsLogo size="sm" />
              <span style={{ color: 'var(--border)', fontSize: 16 }}>·</span>
              <span className="font-black text-sm" style={{ color: 'var(--heading)' }}>Vibe Coding</span>
            </div>
            <div className="w-16" />
          </header>
          <PhaseTimer pagePhase={4} />
        </div>

        {/* Page content */}
        <div className="max-w-2xl mx-auto px-6 py-8">

          {/* Print CTA — hidden on print */}
          <div className="no-print mb-6 text-center">
            <button
              onClick={() => window.print()}
              className="rounded-xl px-8 py-4 font-bold text-white text-base transition-all hover:opacity-90 inline-flex items-center gap-2"
              style={{ background: 'var(--heading)' }}
            >
              🖨️ Imprimir tiquet
            </button>
            <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>O guarda-ho com a PDF des del diàleg d&apos;impressió</p>
          </div>

          {/* Ticket card */}
          <div className="ticket-card rounded-3xl bg-white p-8" style={{ boxShadow: '0 4px 32px rgba(94,36,64,0.10)', border: '2px solid var(--border)' }}>

            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <MSchoolsLogo size="md" />
                <div className="text-xs mt-1 font-semibold tracking-widest uppercase" style={{ color: 'var(--muted)' }}>Vibe Coding · mSchools 2026</div>
              </div>
              <div className="text-right">
                {submission.pairName && (
                  <div className="text-2xl font-black" style={{ color: 'var(--heading)' }}>{submission.pairName}</div>
                )}
                <div className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                  {new Date(submission.createdAt).toLocaleDateString('ca-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>

            {/* Main content: QR + prompt */}
            <div className="flex gap-8 items-start">

              {/* QR code */}
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                {appUrl && <QRCode value={appUrl} size={160} />}
                <div className="text-xs text-center" style={{ color: 'var(--muted)', maxWidth: 160, wordBreak: 'break-all' }}>
                  {appUrl}
                </div>
              </div>

              {/* Prompt details */}
              <div className="flex-1">
                <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--heading)' }}>
                  El nostre recurs
                </div>

                {hasCards ? (
                  <div className="flex flex-col gap-2">
                    {[
                      { label: 'Eix', value: parts[0], color: '#0d9488', bg: '#f0fdfb' },
                      { label: 'Usuari', value: parts[1], color: '#7c3aed', bg: '#f5f3ff' },
                      { label: 'Acció', value: parts[2], color: '#2563eb', bg: '#eff6ff' },
                      { label: 'Repte', value: parts[3], color: '#ea580c', bg: '#fff7ed' },
                      { label: 'Estil', value: parts[4], color: '#be185d', bg: '#fdf2f8' },
                    ].map(({ label, value, color, bg }) => (
                      <div key={label} className="flex items-center gap-2">
                        <span className="text-xs font-bold w-12 flex-shrink-0" style={{ color: 'var(--muted)' }}>{label}</span>
                        <span className="text-sm font-semibold px-2.5 py-0.5 rounded-md" style={{ color, background: bg, border: `1.5px solid ${color}30` }}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm italic leading-relaxed" style={{ color: 'var(--body)' }}>
                    &ldquo;{submission.tasca}&rdquo;
                  </p>
                )}

                {submission.formatLabel && (
                  <div className="mt-3 pt-3 border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                    Format: <strong style={{ color: 'var(--body)' }}>{submission.formatLabel}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <div className="text-xs" style={{ color: 'var(--muted)' }}>
                Escaneja el codi QR per obrir l&apos;eina generada
              </div>
              <div className="text-xs font-bold" style={{ color: 'var(--heading)' }}>
                mschools-vibecoding.vercel.app
              </div>
            </div>

          </div>

          {/* Back button — hidden on print */}
          <div className="no-print mt-6 text-center">
            <button
              onClick={() => router.push(`/result/${id}`)}
              className="text-sm px-4 py-2 rounded-lg"
              style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              ← Tornar al resultat
            </button>
          </div>

        </div>
      </main>
    </>
  );
}
