import Link from 'next/link';

const FOR = [
  {
    emoji: '✅',
    title: 'Reptes reals d\'aula',
    desc: 'Comunicació amb famílies, avaluació, inclusió, benestar, gestió de grup…',
    color: '#16a34a', bg: '#f0fdf4',
  },
  {
    emoji: '🛠️',
    title: 'Recursos per usar avui',
    desc: 'Una eina que el docent o l\'alumne pugui obrir i fer servir directament a classe.',
    color: '#15803d', bg: '#dcfce7',
  },
  {
    emoji: '✨',
    title: 'Simple i funcional',
    desc: 'Un quiz, un joc, una rúbrica, una fitxa. Res complex. Directe al gra.',
    color: '#166534', bg: '#bbf7d0',
  },
  {
    emoji: '🔁',
    title: 'Iterar fins que funcioni',
    desc: 'La primera versió és un punt de partida. Usa el panell de millores per refinar, afegir contingut i ajustar fins que sigui perfecte.',
    color: '#15803d', bg: '#dcfce7',
  },
];

const NOT_FOR = [
  {
    emoji: '🔐',
    title: 'Apps amb login o base de dades',
    desc: 'La IA genera HTML estàtic. Sense comptes, contrasenyes ni emmagatzematge permanent.',
    color: '#dc2626', bg: '#fef2f2',
  },
  {
    emoji: '🚫',
    title: 'Eines genèriques o personals',
    desc: 'No és per a projectes particulars. El recurs ha de tenir una utilitat educativa clara.',
    color: '#b91c1c', bg: '#fee2e2',
  },
  {
    emoji: '🤖',
    title: 'Deixar-ho tot a la IA',
    desc: 'La IA ajuda, però el repte i el context els poseu vosaltres. Sense context, no hi ha bon recurs. I recorda: la primera versió és un punt de partida, cal iterar.',
    color: '#991b1b', bg: '#fecaca',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="font-black text-lg tracking-tight" style={{ color: 'var(--heading)' }}>
          mSchools · Vibe Coding
        </span>
        <div className="flex items-center gap-3">
          <Link href="/gallery" className="text-sm font-medium px-4 py-2 rounded-lg" style={{ color: 'var(--muted)' }}>
            Galeria
          </Link>
          <Link href="/screen" className="text-sm font-medium px-4 py-2 rounded-lg" style={{ color: 'var(--muted)' }}>
            Pantalla
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="text-5xl mb-6">⚡</div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight" style={{ color: 'var(--heading)' }}>
            Construeix un recurs educatiu real, ara mateix
          </h1>
          <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--muted)' }}>
            Seguireu 4 passos per descriure el vostre repte docent. La IA generarà una eina funcional que podreu usar directament a l&apos;aula.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-lg font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--heading)' }}
          >
            ✨ Crear recurs
          </Link>
        </div>

        {/* What it's for */}
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: 'var(--heading)' }}>
              ✅ Per a això estem aquí
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {FOR.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-2xl p-5"
                style={{ background: item.bg, border: `1.5px solid ${item.color}25` }}
              >
                <span className="text-2xl mt-0.5">{item.emoji}</span>
                <div>
                  <div className="font-bold text-sm mb-1" style={{ color: item.color }}>{item.title}</div>
                  <div className="text-sm leading-relaxed" style={{ color: 'var(--body)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* What it's NOT for */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: '#dc2626' }}>
              🔴 Fora de l&apos;abast
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {NOT_FOR.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-4 rounded-2xl p-5"
                style={{ background: item.bg, border: `1.5px solid ${item.color}25` }}
              >
                <span className="text-2xl mt-0.5">{item.emoji}</span>
                <div>
                  <div className="font-bold text-sm mb-1" style={{ color: item.color }}>{item.title}</div>
                  <div className="text-sm leading-relaxed" style={{ color: 'var(--body)' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer note */}
        <p className="text-center text-xs mb-8" style={{ color: 'var(--muted)' }}>
          ~15 minuts · Gemini
        </p>

        {/* Next step CTA */}
        <div className="flex justify-center">
          <Link
            href="/warmup"
            className="inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-lg font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--heading)' }}
          >
            Següent: Warm-up
            <span className="text-xl">→</span>
          </Link>
        </div>

      </div>
    </main>
  );
}
