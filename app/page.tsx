import Link from 'next/link';

const STEPS = [
  { num: '01', label: 'Eixos', emoji: '🎯', desc: 'Àrea temàtica', color: '#0d9488', bg: '#f0fdfb' },
  { num: '02', label: 'Persona', emoji: '👤', desc: 'Qui ho farà servir', color: '#7c3aed', bg: '#f5f3ff' },
  { num: '03', label: 'Repte', emoji: '💡', desc: 'El problema a resoldre', color: '#ea580c', bg: '#fff7ed' },
  { num: '04', label: 'Estil', emoji: '🎨', desc: 'Com ha de ser', color: '#2563eb', bg: '#eff6ff' },
  { num: '05', label: 'Restriccions', emoji: '⚙️', desc: 'Condicions tècniques', color: '#16a34a', bg: '#f0fdf4' },
];

const FEATURES = [
  { emoji: '🃏', text: 'Treballeu amb targetes físiques per construir el prompt' },
  { emoji: '🎤', text: 'Dicteu el prompt per micròfon i la IA el transcriu' },
  { emoji: '⚡', text: 'Gemini genera una webapp educativa funcional en segons' },
  { emoji: '🔁', text: 'Itereu el prompt i milloreu el resultat una vegada' },
  { emoji: '📱', text: 'Obteniu un QR i un tiquet imprimible amb el vostre prompt' },
];

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="font-black text-xl tracking-tight" style={{ color: 'var(--heading)' }}>
          Vibe Coding
        </span>
        <div className="flex items-center gap-3">
          <Link href="/gallery" className="text-sm font-medium px-4 py-2 rounded-lg transition-colors" style={{ color: 'var(--muted)' }}>
            Galeria
          </Link>
          <Link href="/screen" className="text-sm font-medium px-4 py-2 rounded-lg transition-colors" style={{ color: 'var(--muted)' }}>
            Pantalla
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-8 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6 text-sm font-medium border" style={{ borderColor: 'var(--border)', color: 'var(--muted)', background: '#f7f4f7' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
          mSchools Awards 2026
        </div>

        <h1 className="text-6xl md:text-7xl font-black tracking-tighter mb-6 leading-tight" style={{ color: 'var(--heading)' }}>
          Construeix una webapp<br />educativa amb IA
        </h1>

        <p className="text-xl max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: 'var(--muted)' }}>
          Selecciona les targetes, dicta el teu repte per micròfon i Gemini genera una aplicació educativa funcional per a la teva aula.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-lg font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--heading)' }}
          >
            ✨ Crear recurs
          </Link>
          <Link
            href="/gallery"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-lg font-medium border transition-all hover:bg-[#f7f4f7]"
            style={{ borderColor: 'var(--border)', color: 'var(--heading)' }}
          >
            🖼️ Veure la galeria
          </Link>
        </div>
      </section>

      {/* 5 steps */}
      <section className="max-w-5xl mx-auto px-8 pb-16">
        <h2 className="text-2xl font-bold mb-2 text-center" style={{ color: 'var(--heading)' }}>Les 5 capes del prompt</h2>
        <p className="text-center mb-8 text-sm" style={{ color: 'var(--muted)' }}>Cada targeta física correspon a una capa. Juntes formen el prompt.</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {STEPS.map(s => (
            <div
              key={s.num}
              className="rounded-2xl p-5 flex flex-col items-center text-center gap-2"
              style={{ background: s.bg, border: `1.5px solid ${s.color}30` }}
            >
              <span className="text-2xl">{s.emoji}</span>
              <span className="text-xs font-mono font-bold" style={{ color: s.color }}>{s.num}</span>
              <span className="font-bold text-sm" style={{ color: s.color }}>{s.label}</span>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>{s.desc}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-8 pb-20">
        <div className="rounded-3xl p-8 md:p-12" style={{ background: '#f7f4f7', border: '1px solid var(--border)' }}>
          <h2 className="text-2xl font-bold mb-8" style={{ color: 'var(--heading)' }}>Com funciona</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="flex items-start gap-4 rounded-2xl p-5 bg-white" style={{ border: '1px solid var(--border)' }}>
                <span className="text-2xl mt-0.5">{f.emoji}</span>
                <span className="text-sm leading-relaxed" style={{ color: 'var(--body)' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
