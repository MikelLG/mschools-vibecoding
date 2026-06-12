'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MSchoolsLogo } from '@/components/MSchoolsLogo';
import { getSubmission } from '@/lib/firebase';
import type { Submission } from '@/lib/types';

export default function AppRunnerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBar, setShowBar] = useState(true);

  useEffect(() => {
    if (!id) return;
    getSubmission(id as string).then(s => {
      setSubmission(s);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => setShowBar(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="w-10 h-10 rounded-full border-2 border-[#e63946] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#050505]">
        <p className="text-[#888]">Recurs no trobat.</p>
        <button onClick={() => router.push('/')} className="text-[#e63946] hover:underline">← Inici</button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-white relative" onMouseMove={() => setShowBar(true)}>
      {/* Hover bar */}
      <div
        className={`absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 bg-white/95 backdrop-blur border-b transition-all duration-300 ${
          showBar ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-xs transition-colors"
            style={{ color: 'var(--muted)' }}
          >
            ← Enrere
          </button>
          <span className="text-xs" style={{ color: 'var(--border)' }}>|</span>
          <span className="text-xs max-w-xs truncate" style={{ color: 'var(--muted)' }}>{submission.tasca || submission.formatLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <MSchoolsLogo size="sm" />
          {submission.pairName && (
            <span className="text-xs" style={{ color: 'var(--muted)' }}>— {submission.pairName}</span>
          )}
        </div>
      </div>

      {/* Full-screen app */}
      <iframe
        srcDoc={submission.htmlOutput}
        className="w-full h-full"
        sandbox="allow-scripts allow-forms"
        title={submission.formatLabel}
      />
    </div>
  );
}
