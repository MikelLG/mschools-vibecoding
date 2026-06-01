import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Top badge */}
      <div className="relative z-10 mb-8 flex items-center gap-2 rounded-full border border-[#2a2a2a] px-4 py-1.5">
        <span className="h-2 w-2 rounded-full bg-[#e63946] animate-pulse" />
        <span className="text-sm text-[#888] tracking-widest uppercase">mSchools Awards 2026</span>
      </div>

      {/* Main title */}
      <div className="relative z-10 text-center mb-6">
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white mb-2">
          VIBE<span className="text-[#e63946]">CODING</span>
        </h1>
        <p className="text-xl text-[#888] max-w-lg mx-auto leading-relaxed">
          Construeix un recurs educatiu amb IA en 4 capes.<br />
          <span className="text-[#f5f5f5]">ROL → CONTEXT → TASCA → FORMAT</span>
        </p>
      </div>

      {/* CTA buttons */}
      <div className="relative z-10 flex flex-col sm:flex-row gap-4 mt-10">
        <Link
          href="/create"
          className="group flex items-center gap-3 rounded-2xl bg-[#e63946] px-8 py-4 text-lg font-bold text-white transition-all hover:bg-[#c1121f] hover:scale-105 active:scale-100"
        >
          <span className="text-2xl">✨</span>
          Crear recurs
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
        <Link
          href="/gallery"
          className="flex items-center gap-3 rounded-2xl border border-[#2a2a2a] bg-[#141414] px-8 py-4 text-lg font-medium text-[#f5f5f5] transition-all hover:border-[#444] hover:bg-[#1e1e1e] hover:scale-105 active:scale-100"
        >
          <span className="text-2xl">🖼️</span>
          Veure galeria
        </Link>
      </div>

      {/* Step preview */}
      <div className="relative z-10 mt-16 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl w-full">
        {[
          { num: '01', label: 'ROL', emoji: '👩‍🏫', desc: 'Qui soc?' },
          { num: '02', label: 'CONTEXT', emoji: '🏫', desc: 'On passa?' },
          { num: '03', label: 'TASCA', emoji: '🎯', desc: 'Quin repte?' },
          { num: '04', label: 'FORMAT', emoji: '✨', desc: 'Com ha de sortir?' },
        ].map(step => (
          <div key={step.num} className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4 text-center">
            <div className="text-xs text-[#e63946] font-mono font-bold mb-1">{step.num}</div>
            <div className="text-2xl mb-1">{step.emoji}</div>
            <div className="font-bold text-sm text-white">{step.label}</div>
            <div className="text-xs text-[#888] mt-0.5">{step.desc}</div>
          </div>
        ))}
      </div>

      {/* Screen link for facilitator */}
      <div className="relative z-10 mt-10">
        <Link href="/screen" className="text-xs text-[#444] hover:text-[#888] transition-colors">
          pantalla col·lectiva →
        </Link>
      </div>
    </main>
  );
}
