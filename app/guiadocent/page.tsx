import Link from 'next/link';
import { MSchoolsLogo } from '@/components/MSchoolsLogo';

const COMPETENCIES = [
  { title: 'Comunicació escrita', desc: 'Redactar instruccions precises i efectives per transmetre una idea complexa a una IA.', color: '#f0fdf4', border: '#bbf7d0', heading: '#16a34a' },
  { title: 'Pensament creatiu', desc: 'Imaginar solucions educatives originals i explorar formats inesperats amb ajuda de la IA.', color: '#faf5ff', border: '#e9d5ff', heading: '#7c3aed' },
  { title: 'Alfabetització digital', desc: 'Entendre com funcionen els models de IA generativa i interaccionar-hi de manera crítica.', color: '#eff6ff', border: '#bfdbfe', heading: '#1d4ed8' },
  { title: 'Pensament crític', desc: 'Avaluar els resultats generats per la IA, identificar limitacions i decidir com millorar-los.', color: '#fff1f2', border: '#fecdd3', heading: '#be123c' },
  { title: 'Disseny centrat en l\'usuari', desc: 'Definir a qui va dirigida l\'eina i quin problema educatiu real vol resoldre.', color: '#fffbeb', border: '#fed7aa', heading: '#b45309' },
  { title: 'Col·laboració', desc: 'Compartir estratègies, reflexionar en grup sobre els resultats i construir coneixement col·lectiu.', color: '#f0fdf4', border: '#a7f3d0', heading: '#059669' },
];

const STEPS = [
  { n: '01', title: 'El facilitador configura la sessió', desc: 'Obre /screen, selecciona la fase activa i controla els temporitzadors de totes les participants en temps real des del projector.' },
  { n: '02', title: 'Els participants accedeixen a l\'eina', desc: 'Obren el navegador i van a la URL del taller. No cal cap registre ni instal·lació. Funciona en qualsevol dispositiu amb navegador modern.' },
  { n: '03', title: 'Warm-up · 4 minuts', desc: 'Exploren una app educativa d\'exemple ja generada i intenten endevinar quin prompt la va crear. Activa la curiositat i trenca el gel.' },
  { n: '04', title: 'Construcció del prompt · 4 minuts', desc: 'Seleccionen 5 targetes (Eix, Usuari, Repte, Acció, Estil) i afegeixen context addicional per escrit o per veu. Es construeix un prompt ric i estructurat.' },
  { n: '05', title: 'La IA genera l\'eina educativa', desc: 'Gemini construeix una webapp educativa funcional en HTML. El sistema intenta fins a 36 vegades amb 6 models diferents per garantir que sempre funciona.' },
  { n: '06', title: 'Iteració i millora · 5 minuts', desc: 'Proven l\'app generada, apliquen millores amb text o veu, editen el prompt complet si volen i posen el nom al grup.' },
  { n: '07', title: 'Publica i imprimeix · 2 minuts', desc: 'Imprimeixen el tiquet del grup: QR, nom i prompt. L\'eina queda publicada a la galeria pública del taller.' },
];

const CARDS = [
  { label: 'Eix', color: '#7c3aed', bg: '#f5f3ff', desc: 'L\'àrea de coneixement o matèria', example: 'Matemàtiques, Llengua, Ciències, Arts...' },
  { label: 'Usuari', color: '#0d9488', bg: '#f0fdfa', desc: 'A qui va dirigida l\'eina educativa', example: 'Alumnes de 3r ESO, Docents, Famílies...' },
  { label: 'Repte', color: '#ea580c', bg: '#fff7ed', desc: 'Quin problema educatiu vol resoldre', example: 'Practicar fraccions, Aprendre vocabulari...' },
  { label: 'Acció', color: '#1d4ed8', bg: '#eff6ff', desc: 'Quin tipus d\'eina cal generar', example: 'Quiz interactiu, Simulador, Joc, Generador...' },
  { label: 'Estil', color: '#be123c', bg: '#fff1f2', desc: 'Com ha de ser visualment i funcionalment', example: 'Visual i colorit, Minimalista, Gamificat...' },
];

const ACTIVITIES = [
  { title: 'Repte per matèria', time: '20 min', level: 'Totes les etapes', desc: 'Cada grup construeix un prompt per a la seva pròpia assignatura. Es comparen les eines generades i es debat quina és més útil.', tags: ['Transversal', 'Reflexió'] },
  { title: 'Millora en 3 rondes', time: '30 min', level: 'Secundària / Batxillerat', desc: 'Es genera una eina, es fa una ronda de millora col·lectiva, i se\'n genera una versió millorada. Es comparen les dues versions.', tags: ['Iteració', 'Millora contínua'] },
  { title: 'L\'eina impossible', time: '25 min', level: 'Batxillerat / Cicles', desc: 'Cada grup intenta generar una eina per a un repte educatiu molt complex o abstracte. Debat sobre les limitacions de la IA.', tags: ['Pensament crític', 'Ètica digital'] },
  { title: 'Prompt per a un company', time: '20 min', level: 'Totes les etapes', desc: 'Cada grup crea una eina per a un altre grup de la classe. El grup receptor la valora i dona feedback.', tags: ['Col·laboració', 'Disseny usuari'] },
  { title: 'Galeria i votació', time: '15 min', level: 'Totes les etapes', desc: 'Es projecten totes les eines generades a la galeria. El grup vota la més útil, la més creativa i la més sorprenent.', tags: ['Avaluació entre iguals'] },
  { title: 'Prompt engineering avançat', time: '45 min', level: 'Batxillerat / Cicles / FP', desc: 'Partint del prompt generat per les targetes, cada grup edita el prompt complet manualment i itera 3 vegades. Anàlisi de com canvia el resultat.', tags: ['Tecnologia', 'Metodologia científica'] },
];

const TIPS = [
  { title: 'Prova-ho abans', desc: 'Fes una sessió de prova sol/a amb /screen i un participant. Comprova que els temporitzadors sincronitzen i que la generació funciona.' },
  { title: 'Projector a /screen', desc: 'Obre /screen en un segon dispositiu connectat al projector. Els participants veuen el seu temporitzador sincronitzat automàticament.' },
  { title: 'Warm-up en grup', desc: 'Deixa que els participants debatin en veu alta quin creuen que és el prompt. Genera conversa abans de posar-se a treballar.' },
  { title: 'Debat post-activitat', desc: 'Reserva 10 minuts per preguntar: Quin prompt ha funcionat millor? Per què? Quines targetes han marcat la diferència?' },
  { title: 'Parla dels biaixos', desc: 'Si apareixen resultats estereotipats o inadequats, aprofita-ho: és una oportunitat perfecta per parlar sobre com funcionen els models de IA.' },
  { title: 'Guarda els millors resultats', desc: 'Cada eina generada queda a la galeria pública. Comparteix l\'URL amb els grups al final — és el seu producte, poden ensenyar-lo.' },
];

const REQUIREMENTS = [
  'Navegador modern (Chrome, Firefox, Edge, Safari) — sense instal·lació',
  'Connexió a internet estable per a tots els participants',
  'Un dispositiu per grup (pot ser un mòbil, tablet o ordinador)',
  'Projector o pantalla gran per al facilitador (/screen)',
  'Cap compte ni registre necessari per als participants',
];

export default function GuiaDocentPage() {
  return (
    <div style={{ background: '#fdf8f6', minHeight: '100vh', fontFamily: 'var(--font-inter, sans-serif)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', paddingTop: 64, paddingBottom: 48 }}>
          <div style={{ marginBottom: 24 }}><MSchoolsLogo size="lg" /></div>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 2, color: '#888', textTransform: 'uppercase', marginBottom: 12 }}>Guia Docent</div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: '#5e2440', margin: '0 0 16px', lineHeight: 1.1 }}>Vibe Coding</h1>
          <p style={{ fontSize: 18, color: '#555', maxWidth: 560, margin: '0 auto 28px', lineHeight: 1.6 }}>
            Una activitat per crear eines educatives amb IA de manera col·laborativa, creativa i reflexiva.
          </p>
<Link href="/screen" style={{ display: 'inline-block', background: '#00e082', color: 'white', fontWeight: 700, fontSize: 15, padding: '12px 28px', borderRadius: 999, textDecoration: 'none' }}>
            Tauler del facilitador →
          </Link>
        </div>

        <hr style={{ border: 'none', borderTop: '1.5px solid #e8dfe6', marginBottom: 56 }} />

        {/* Què és */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#5e2440', marginBottom: 8 }}>Què és el Vibe Coding?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
            <div>
              <p style={{ color: '#444', lineHeight: 1.75, marginBottom: 16 }}>
                <strong>Vibe Coding</strong> és un taller pràctic on els participants construeixen un <strong>prompt estructurat</strong> seleccionant 5 targetes i la IA genera una <strong>webapp educativa funcional</strong> en temps real.
              </p>
              <p style={{ color: '#444', lineHeight: 1.75 }}>
                A diferència d'altres activitats d'IA, el Vibe Coding posa l'accent en el <strong>disseny pedagògic</strong>: qui és l'usuari, quin problema resol i com hauria de funcionar l'eina. La IA és el constructor; les participants, les arquitectes.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '🎯', text: 'Un repte comú per a tot el grup' },
                { icon: '⏱️', text: 'Tres fases amb temps limitat i sincronitzat' },
                { icon: '🤖', text: 'La IA genera una eina educativa funcional' },
                { icon: '🔄', text: 'S\'itera i millora el resultat en directe' },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1.5px solid #e8dfe6', borderRadius: 10, padding: '12px 16px', background: 'white', fontSize: 14, color: '#333' }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>{text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Finalitat educativa */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#5e2440', marginBottom: 6 }}>Finalitat educativa</h2>
          <p style={{ color: '#666', marginBottom: 24 }}>El Vibe Coding desenvolupa competències transversals i específiques de manera integrada.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {COMPETENCIES.map(c => (
              <div key={c.title} style={{ background: c.color, border: `1.5px solid ${c.border}`, borderRadius: 10, padding: '16px 18px' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: c.heading, marginBottom: 6 }}>{c.title}</div>
                <div style={{ fontSize: 13, color: '#444', lineHeight: 1.5 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Com funciona */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#5e2440', marginBottom: 24 }}>Com funciona l'activitat</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {STEPS.map(s => (
              <div key={s.n} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', border: '1.5px solid #e8dfe6', borderRadius: 10, padding: '16px 20px', background: 'white' }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#d4b8d0', minWidth: 36, lineHeight: 1 }}>{s.n}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#5e2440', marginBottom: 4 }}>{s.title}</div>
                  <div style={{ fontSize: 14, color: '#555', lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Les 5 targetes */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#5e2440', marginBottom: 6 }}>Les 5 targetes del prompt</h2>
          <p style={{ color: '#666', marginBottom: 24 }}>Cada participant construeix el seu prompt seleccionant una targeta de cada categoria.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            {CARDS.map(c => (
              <div key={c.label} style={{ background: c.bg, border: `2px solid ${c.color}22`, borderRadius: 10, padding: '14px 12px', textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: c.color, marginBottom: 6 }}>{c.label}</div>
                <div style={{ fontSize: 12, color: '#444', lineHeight: 1.5, marginBottom: 8 }}>{c.desc}</div>
                <div style={{ fontSize: 11, color: '#888', fontStyle: 'italic', lineHeight: 1.4 }}>{c.example}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Idees d'activitats */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#5e2440', marginBottom: 6 }}>Idees d'activitats per a l'aula</h2>
          <p style={{ color: '#666', marginBottom: 24 }}>Propostes adaptades a diferents etapes educatives i contextos curriculars.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {ACTIVITIES.map(a => (
              <div key={a.title} style={{ border: '1.5px solid #e8dfe6', borderRadius: 10, padding: '16px 18px', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#5e2440' }}>{a.title}</div>
                  <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 999, padding: '2px 10px', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 8 }}>{a.time}</span>
                </div>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>{a.level}</div>
                <div style={{ fontSize: 13, color: '#444', lineHeight: 1.6, marginBottom: 10 }}>{a.desc}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {a.tags.map(t => (
                    <span key={t} style={{ background: '#f5f0f5', color: '#7c3aed', border: '1px solid #e9d5ff', borderRadius: 999, padding: '2px 10px', fontSize: 11 }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Requisits tècnics */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#5e2440', marginBottom: 20 }}>Requisits tècnics</h2>
          <div style={{ border: '1.5px solid #e8dfe6', borderRadius: 10, background: 'white', overflow: 'hidden' }}>
            {REQUIREMENTS.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: i < REQUIREMENTS.length - 1 ? '1px solid #f0e8ee' : 'none', fontSize: 14, color: '#333' }}>
                <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 16 }}>✓</span>
                {r}
              </div>
            ))}
          </div>
        </section>

        {/* Consells */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#5e2440', marginBottom: 24 }}>Consells per al facilitador</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {TIPS.map(t => (
              <div key={t.title} style={{ border: '1.5px solid #e8dfe6', borderRadius: 10, padding: '16px 18px', background: 'white' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#5e2440', marginBottom: 6 }}>{t.title}</div>
                <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Més recursos */}
        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#5e2440', marginBottom: 6 }}>Més recursos</h2>
          <p style={{ color: '#666', marginBottom: 24 }}>Informació i comunitat per aprofundir en el Vibe Coding educatiu.</p>
          <a
            href="https://vibe-coding-educativo.github.io/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', textDecoration: 'none' }}
          >
            <div style={{ border: '2px solid #00e08240', borderRadius: 14, padding: '24px 28px', background: '#f0fdf8', display: 'flex', gap: 24, alignItems: 'flex-start', transition: 'box-shadow 0.15s' }}>
              <span style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>🌐</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 17, color: '#5e2440', marginBottom: 4 }}>
                  Vibe Coding Educatiu — Comunitat i metodologia
                </div>
                <div style={{ fontSize: 14, color: '#444', lineHeight: 1.65, marginBottom: 12 }}>
                  Espai obert per a docents que volen crear eines educatives interactives amb IA sense necessitat de programar. Inclou galeria d'aplicacions, butlletí setmanal, grup de Telegram i guies per integrar IA en plataformes com Moodle o Google Sites.
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#00e082', color: 'white', fontWeight: 700, fontSize: 13, padding: '6px 16px', borderRadius: 999 }}>
                  vibe-coding-educativo.github.io →
                </span>
              </div>
            </div>
          </a>
        </section>

        {/* CTA */}
        <div style={{ border: '1.5px solid #e8dfe6', borderRadius: 16, padding: '40px 32px', textAlign: 'center', background: 'white' }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#5e2440', marginBottom: 10 }}>Preparada per començar?</h2>
          <p style={{ color: '#666', marginBottom: 28, fontSize: 15 }}>Obre el tauler del facilitador, selecciona la fase i comença el taller.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/screen" style={{ display: 'inline-block', background: '#00e082', color: 'white', fontWeight: 700, fontSize: 15, padding: '12px 28px', borderRadius: 999, textDecoration: 'none' }}>
              Tauler del facilitador →
            </Link>
            <Link href="/" style={{ display: 'inline-block', border: '1.5px solid #d1c5d0', color: '#5e2440', fontWeight: 600, fontSize: 15, padding: '12px 28px', borderRadius: 999, textDecoration: 'none', background: 'white' }}>
              Inici del taller
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
