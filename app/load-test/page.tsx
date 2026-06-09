'use client';

import { useState, useCallback } from 'react';
import { MSchoolsLogo } from '@/components/MSchoolsLogo';

const PROMPTS = [
  { label: 'Benestar social', sub: 'Alumnes · Mini-joc · Regular emocions · Infantil', selectedCards: [{ group: 'Eix', value: 'Benestar social' }, { group: 'Usuari final', value: 'Alumnes' }, { group: 'Acció principal', value: 'Crear un mini-joc' }, { group: 'Repte', value: 'Regular emocions' }, { group: 'Estil', value: 'Infantil' }], format: 'joc', formatLabel: 'Joc educatiu' },
  { label: 'Educació mediàtica', sub: 'Docents · Retroalimentació · Avaluació · Minimalista', selectedCards: [{ group: 'Eix', value: 'Educació mediàtica' }, { group: 'Usuari final', value: 'Docents' }, { group: 'Acció principal', value: 'Generar retroalimentació' }, { group: 'Repte', value: 'Avaluació' }, { group: 'Estil', value: 'Minimalista' }], format: 'rubrica', formatLabel: "Rúbrica d'avaluació" },
  { label: 'Equitat i inclusió', sub: 'Famílies · Recollir dades · Rebre informació · Alt contrast', selectedCards: [{ group: 'Eix', value: 'Equitat i inclusió' }, { group: 'Usuari final', value: 'Famílies' }, { group: 'Acció principal', value: "Recol·lectar dades i mostrar-los a l'instant" }, { group: 'Repte', value: 'Rebre informació' }, { group: 'Estil', value: 'Alt contrast' }], format: 'formulari', formatLabel: 'Formulari per a famílies' },
  { label: 'Art i creativitat', sub: 'Alumnes · Activitat creativa · Explorar concepte · Creatiu', selectedCards: [{ group: 'Eix', value: 'Art i creativitat' }, { group: 'Usuari final', value: 'Alumnes' }, { group: 'Acció principal', value: 'Facilitar una activitat creativa' }, { group: 'Repte', value: 'Explorar un concepte' }, { group: 'Estil', value: 'Creatiu / artístic' }], format: 'activitat', formatLabel: "Activitat per a l'aula" },
  { label: 'Consciència social', sub: 'Docents · Comparar escenaris · Gestió aula · Científic', selectedCards: [{ group: 'Eix', value: 'Consciència social' }, { group: 'Usuari final', value: 'Docents' }, { group: 'Acció principal', value: 'Comparar escenaris (abans/després, opció A/B)' }, { group: 'Repte', value: "Gestió d'aula" }, { group: 'Estil', value: 'Científic' }], format: 'activitat', formatLabel: "Activitat per a l'aula" },
  { label: 'Cultura i diversitat', sub: 'Alumnes · Simular situacions · Col·laborar · Narratiu', selectedCards: [{ group: 'Eix', value: 'Cultura i diversitat' }, { group: 'Usuari final', value: 'Alumnes' }, { group: 'Acció principal', value: 'Simular situacions (emocionals, socials, científiques...)' }, { group: 'Repte', value: 'Col·laborar en grup' }, { group: 'Estil', value: 'Narratiu (per passos)' }], format: 'activitat', formatLabel: "Activitat per a l'aula" },
  { label: 'Benestar social', sub: 'Docents · Reflexió emocional · Inclusió · Ludificat', selectedCards: [{ group: 'Eix', value: 'Benestar social' }, { group: 'Usuari final', value: 'Docents' }, { group: 'Acció principal', value: 'Acompanyar una reflexió emocional' }, { group: 'Repte', value: 'Inclusió i accessibilitat' }, { group: 'Estil', value: 'Ludificat' }], format: 'joc', formatLabel: 'Joc educatiu' },
  { label: 'Educació mediàtica', sub: 'Alumnes · Classificar informació · Practicar · Interactiu', selectedCards: [{ group: 'Eix', value: 'Educació mediàtica' }, { group: 'Usuari final', value: 'Alumnes' }, { group: 'Acció principal', value: 'Classificar informació' }, { group: 'Repte', value: 'Practicar un contingut' }, { group: 'Estil', value: 'Interactiu (botons, sliders, arrossegar)' }], format: 'quiz', formatLabel: 'Quiz interactiu' },
  { label: 'Equitat i inclusió', sub: 'Famílies · Suggerències · Benestar · Animacions', selectedCards: [{ group: 'Eix', value: 'Equitat i inclusió' }, { group: 'Usuari final', value: 'Famílies' }, { group: 'Acció principal', value: 'Suggerències automàtiques' }, { group: 'Repte', value: 'Acompanyar benestar' }, { group: 'Estil', value: 'Amb animacions' }], format: 'activitat', formatLabel: "Activitat per a l'aula" },
  { label: 'Consciència social', sub: 'Alumnes · Ruletes · Autoavaluar-se · Infantil', selectedCards: [{ group: 'Eix', value: 'Consciència social' }, { group: 'Usuari final', value: 'Alumnes' }, { group: 'Acció principal', value: 'Ruletes, sortejos, targetes aleatòries' }, { group: 'Repte', value: 'Autoavaluar-se' }, { group: 'Estil', value: 'Infantil' }], format: 'joc', formatLabel: 'Joc educatiu' },
];

type Status = 'idle' | 'generating' | 'success' | 'error';

interface UserState {
  status: Status;
  elapsed: number;
  htmlLen: number;
  error: string;
  startedAt: number;
  model: string;
}

const INITIAL: UserState = { status: 'idle', elapsed: 0, htmlLen: 0, error: '', startedAt: 0, model: '' };

export default function LoadTestPage() {
  const [users, setUsers] = useState<UserState[]>(Array(10).fill(null).map(() => ({ ...INITIAL })));
  const [running, setRunning] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState<number | null>(null);
  const [concurrency, setConcurrency] = useState(10);

  const updateUser = useCallback((i: number, patch: Partial<UserState>) => {
    setUsers(prev => prev.map((u, idx) => idx === i ? { ...u, ...patch } : u));
  }, []);

  const runTest = useCallback(async () => {
    setRunning(true);
    setTotalElapsed(null);
    setUsers(Array(concurrency).fill(null).map(() => ({ ...INITIAL })));

    const startAll = Date.now();

    const promises = Array.from({ length: concurrency }, async (_, i) => {
      const prompt = PROMPTS[i % PROMPTS.length];
      updateUser(i, { status: 'generating', startedAt: Date.now() });

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 250_000);

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedCards: prompt.selectedCards,
            promptPreview: prompt.label,
            extraContext: '',
            format: prompt.format,
            formatLabel: prompt.formatLabel,
            sessionId: 'load-test',
          }),
          signal: controller.signal,
        });

        clearTimeout(timer);
        const elapsed = (Date.now() - startAll) / 1000;

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
          updateUser(i, { status: 'error', elapsed, error: err.error ?? res.statusText });
          return;
        }

        const data = await res.json() as { submission?: { htmlOutput?: string }; modelUsed?: string };
        const htmlLen = data.submission?.htmlOutput?.length ?? 0;
        const model = data.modelUsed ?? '';
        updateUser(i, { status: 'success', elapsed, htmlLen, model });
      } catch (err) {
        clearTimeout(timer);
        const elapsed = (Date.now() - startAll) / 1000;
        const msg = (err as Error).name === 'AbortError' ? 'Timeout (250s)' : (err as Error).message;
        updateUser(i, { status: 'error', elapsed, error: msg });
      }
    });

    await Promise.allSettled(promises);
    setTotalElapsed((Date.now() - startAll) / 1000);
    setRunning(false);
  }, [concurrency, updateUser]);

  const reset = () => {
    setUsers(Array(10).fill(null).map(() => ({ ...INITIAL })));
    setTotalElapsed(null);
  };

  const passed = users.filter(u => u.status === 'success').length;
  const failed = users.filter(u => u.status === 'error').length;
  const active = users.filter(u => u.status === 'generating').length;

  return (
    <main className="min-h-screen" style={{ background: '#f7f4f7' }}>
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-white" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <MSchoolsLogo size="sm" />
          <span style={{ color: 'var(--border)', fontSize: 16 }}>·</span>
          <span className="font-black text-sm" style={{ color: 'var(--heading)' }}>Simulació de càrrega</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold" style={{ color: 'var(--muted)' }}>Usuaris:</label>
          <input
            type="number" min={1} max={10} value={concurrency}
            onChange={e => setConcurrency(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
            disabled={running}
            className="w-14 rounded-lg px-2 py-1 text-sm text-center font-bold focus:outline-none"
            style={{ border: '1.5px solid var(--border)', background: 'white' }}
          />
          <button onClick={reset} disabled={running} className="text-xs px-3 py-1.5 rounded-lg" style={{ border: '1px solid var(--border)', color: 'var(--muted)', background: 'white' }}>
            Reset
          </button>
          <button
            onClick={runTest} disabled={running}
            className="px-5 py-2 rounded-xl font-bold text-sm transition-all"
            style={running ? { background: '#f0eaf0', color: 'var(--muted)', cursor: 'not-allowed' } : { background: 'var(--heading)', color: 'white' }}
          >
            {running ? `Generant... (${active} actius)` : '▶ Iniciar simulació'}
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Stats bar */}
        {(running || totalElapsed !== null) && (
          <div className="flex gap-4 mb-6">
            <Stat label="Correctes" value={passed} color="#16a34a" />
            <Stat label="Errors" value={failed} color="#dc2626" />
            <Stat label="Generant" value={active} color="#ea580c" />
            {totalElapsed !== null && (
              <Stat label="Temps total" value={`${totalElapsed.toFixed(1)}s`} color="var(--heading)" />
            )}
            {totalElapsed !== null && (
              <div className="flex-1 rounded-xl flex items-center justify-center font-black text-lg"
                style={{ background: failed === 0 ? '#f0fdf4' : '#fff1f2', color: failed === 0 ? '#16a34a' : '#dc2626', border: `2px solid ${failed === 0 ? '#bbf7d0' : '#fecdd3'}` }}>
                {failed === 0 ? '🎉 Tots correctes!' : `${passed}/${concurrency} correctes`}
              </div>
            )}
          </div>
        )}

        {/* User grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: concurrency }, (_, i) => (
            <UserCard key={i} index={i} user={users[i]} prompt={PROMPTS[i % PROMPTS.length]} />
          ))}
        </div>

        {/* Instructions */}
        {!running && totalElapsed === null && (
          <div className="mt-8 rounded-2xl p-6 text-center" style={{ background: 'white', border: '1.5px solid var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Prem <strong>Iniciar simulació</strong> per enviar {concurrency} peticions simultànies a l&apos;API de Gemini.
              Cada targeta mostra l&apos;estat en temps real.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function UserCard({ index, user, prompt }: { index: number; user: UserState; prompt: typeof PROMPTS[0] }) {
  const statusColor = {
    idle: 'var(--border)',
    generating: '#ea580c',
    success: '#16a34a',
    error: '#dc2626',
  }[user.status];

  const statusBg = {
    idle: 'white',
    generating: '#fff7ed',
    success: '#f0fdf4',
    error: '#fff1f2',
  }[user.status];

  const statusLabel = {
    idle: 'En espera',
    generating: 'Generant...',
    success: '✓ Llest',
    error: '✗ Error',
  }[user.status];

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2 transition-all duration-300"
      style={{ background: statusBg, border: `2px solid ${statusColor}40`, minHeight: 140 }}>

      {/* User number + status */}
      <div className="flex items-center justify-between">
        <span className="font-black text-lg" style={{ color: statusColor }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        {user.status === 'generating' && (
          <div className="w-4 h-4 rounded-full border-2 animate-spin"
            style={{ borderColor: '#ea580c40', borderTopColor: '#ea580c' }} />
        )}
        {user.status === 'success' && <span style={{ color: '#16a34a' }}>✓</span>}
        {user.status === 'error' && <span style={{ color: '#dc2626' }}>✗</span>}
      </div>

      {/* Prompt label */}
      <div className="text-xs font-bold truncate" style={{ color: statusColor }}>{prompt.label}</div>
      <div className="text-xs truncate" style={{ color: 'var(--muted)' }}>{prompt.sub}</div>

      {/* Status */}
      <div className="mt-auto">
        <div className="text-xs font-bold" style={{ color: statusColor }}>{statusLabel}</div>
        {user.elapsed > 0 && (
          <div className="text-xs" style={{ color: 'var(--muted)' }}>
            {user.elapsed.toFixed(1)}s
            {user.status === 'success' && ` · ${(user.htmlLen / 1000).toFixed(1)}kb`}
          </div>
        )}
        {user.model && (
          <div className="text-xs font-bold truncate" style={{ color: statusColor, opacity: 0.7 }}>
            {user.model.replace('gemini-', '')}
          </div>
        )}
        {user.error && (
          <div className="text-xs mt-1 leading-tight" style={{ color: '#dc2626' }}>
            {user.error.length > 40 ? user.error.slice(0, 40) + '…' : user.error}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl px-4 py-3 flex flex-col items-center gap-1" style={{ background: 'white', border: '1.5px solid var(--border)', minWidth: 80 }}>
      <span className="text-xl font-black" style={{ color }}>{value}</span>
      <span className="text-xs" style={{ color: 'var(--muted)' }}>{label}</span>
    </div>
  );
}
