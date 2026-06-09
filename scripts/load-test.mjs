/**
 * Vibe Coding — Concurrent load test
 * Simulates N users generating apps simultaneously.
 *
 * Usage:
 *   node scripts/load-test.mjs                    → local (localhost:3000)
 *   node scripts/load-test.mjs production         → mschools-vibecoding.vercel.app
 *   node scripts/load-test.mjs production 5       → 5 concurrent users
 */

const TARGET = process.argv[2] === 'production'
  ? 'https://mschools-vibecoding.vercel.app'
  : 'http://localhost:3000';

const CONCURRENT_USERS = parseInt(process.argv[3] ?? '10', 10);
const TIMEOUT_MS = 250_000; // 250s — just above Vercel's 240s maxDuration

const PROMPTS = [
  { selectedCards: [{ group: 'Eix', value: 'Benestar social' }, { group: 'Usuari final', value: 'Alumnes' }, { group: 'Acció principal', value: 'Crear un mini-joc' }, { group: 'Repte', value: 'Regular emocions' }, { group: 'Estil', value: 'Infantil' }], promptPreview: 'Benestar social · Alumnes · Crear un mini-joc · Regular emocions · Infantil', format: 'joc', formatLabel: 'Joc educatiu' },
  { selectedCards: [{ group: 'Eix', value: 'Educació mediàtica' }, { group: 'Usuari final', value: 'Docents' }, { group: 'Acció principal', value: 'Generar retroalimentació' }, { group: 'Repte', value: 'Avaluació' }, { group: 'Estil', value: 'Minimalista' }], promptPreview: 'Educació mediàtica · Docents · Generar retroalimentació · Avaluació · Minimalista', format: 'rubrica', formatLabel: "Rúbrica d'avaluació" },
  { selectedCards: [{ group: 'Eix', value: 'Equitat i inclusió' }, { group: 'Usuari final', value: 'Famílies' }, { group: 'Acció principal', value: "Recol·lectar dades i mostrar-los a l'instant" }, { group: 'Repte', value: 'Rebre informació' }, { group: 'Estil', value: 'Alt contrast' }], promptPreview: 'Equitat i inclusió · Famílies · Recol·lectar dades · Rebre informació · Alt contrast', format: 'formulari', formatLabel: 'Formulari per a famílies' },
  { selectedCards: [{ group: 'Eix', value: 'Art i creativitat' }, { group: 'Usuari final', value: 'Alumnes' }, { group: 'Acció principal', value: 'Facilitar una activitat creativa' }, { group: 'Repte', value: 'Explorar un concepte' }, { group: 'Estil', value: 'Creatiu / artístic' }], promptPreview: "Art i creativitat · Alumnes · Facilitar una activitat creativa · Explorar un concepte · Creatiu", format: 'activitat', formatLabel: "Activitat per a l'aula" },
  { selectedCards: [{ group: 'Eix', value: 'Consciència social' }, { group: 'Usuari final', value: 'Docents' }, { group: 'Acció principal', value: 'Comparar escenaris (abans/després, opció A/B)' }, { group: 'Repte', value: "Gestió d'aula" }, { group: 'Estil', value: 'Científic' }], promptPreview: "Consciència social · Docents · Comparar escenaris · Gestió d'aula · Científic", format: 'activitat', formatLabel: "Activitat per a l'aula" },
  { selectedCards: [{ group: 'Eix', value: 'Cultura i diversitat' }, { group: 'Usuari final', value: 'Alumnes' }, { group: 'Acció principal', value: 'Simular situacions (emocionals, socials, científiques...)' }, { group: 'Repte', value: 'Col·laborar en grup' }, { group: 'Estil', value: 'Narratiu (per passos)' }], promptPreview: 'Cultura i diversitat · Alumnes · Simular situacions · Col·laborar en grup · Narratiu (per passos)', format: 'activitat', formatLabel: "Activitat per a l'aula" },
  { selectedCards: [{ group: 'Eix', value: 'Benestar social' }, { group: 'Usuari final', value: 'Docents' }, { group: 'Acció principal', value: 'Acompanyar una reflexió emocional' }, { group: 'Repte', value: 'Inclusió i accessibilitat' }, { group: 'Estil', value: 'Ludificat' }], promptPreview: 'Benestar social · Docents · Acompanyar una reflexió emocional · Inclusió · Ludificat', format: 'joc', formatLabel: 'Joc educatiu' },
  { selectedCards: [{ group: 'Eix', value: 'Educació mediàtica' }, { group: 'Usuari final', value: 'Alumnes' }, { group: 'Acció principal', value: 'Classificar informació' }, { group: 'Repte', value: 'Practicar un contingut' }, { group: 'Estil', value: 'Interactiu (botons, sliders, arrossegar)' }], promptPreview: 'Educació mediàtica · Alumnes · Classificar informació · Practicar un contingut · Interactiu', format: 'quiz', formatLabel: 'Quiz interactiu' },
  { selectedCards: [{ group: 'Eix', value: 'Equitat i inclusió' }, { group: 'Usuari final', value: 'Famílies' }, { group: 'Acció principal', value: 'Suggerències automàtiques' }, { group: 'Repte', value: 'Acompanyar benestar' }, { group: 'Estil', value: 'Amb animacions' }], promptPreview: 'Equitat i inclusió · Famílies · Suggerències automàtiques · Acompanyar benestar · Amb animacions', format: 'activitat', formatLabel: "Activitat per a l'aula" },
  { selectedCards: [{ group: 'Eix', value: 'Consciència social' }, { group: 'Usuari final', value: 'Alumnes' }, { group: 'Acció principal', value: 'Ruletes, sortejos, targetes aleatòries' }, { group: 'Repte', value: 'Autoavaluar-se' }, { group: 'Estil', value: 'Infantil' }], promptPreview: 'Consciència social · Alumnes · Ruletes, sortejos · Autoavaluar-se · Infantil', format: 'joc', formatLabel: 'Joc educatiu' },
];

async function generateOne(index) {
  const prompt = PROMPTS[index % PROMPTS.length];
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const start = Date.now();

  try {
    const res = await fetch(`${TARGET}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...prompt, extraContext: '', sessionId: 'load-test' }),
      signal: controller.signal,
    });

    clearTimeout(timer);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      return { index, success: false, elapsed, error: err.error ?? res.statusText };
    }

    const data = await res.json();
    const htmlLen = data.submission?.htmlOutput?.length ?? 0;
    return { index, success: true, elapsed, htmlLen };
  } catch (err) {
    clearTimeout(timer);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    const msg = err.name === 'AbortError' ? `TIMEOUT after ${elapsed}s` : err.message;
    return { index, success: false, elapsed, error: msg };
  }
}

async function run() {
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  Vibe Coding — Load Test`);
  console.log(`  Target : ${TARGET}`);
  console.log(`  Users  : ${CONCURRENT_USERS} concurrent`);
  console.log(`${'─'.repeat(60)}\n`);
  console.log(`Firing ${CONCURRENT_USERS} requests simultaneously...\n`);

  const startAll = Date.now();
  let passed = 0;
  let failed = 0;

  // Print results as they arrive, not all at once
  const promises = Array.from({ length: CONCURRENT_USERS }, (_, i) =>
    generateOne(i).then(r => {
      const icon = r.success ? '✅' : '❌';
      const detail = r.success
        ? `${r.elapsed}s — HTML: ${r.htmlLen} chars`
        : `${r.elapsed}s — ERROR: ${r.error}`;
      console.log(`  ${icon}  User ${String(r.index + 1).padStart(2, '0')}  ${detail}`);
      if (r.success) passed++; else failed++;
      return r;
    })
  );

  await Promise.allSettled(promises);

  const totalElapsed = ((Date.now() - startAll) / 1000).toFixed(1);
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  Total time : ${totalElapsed}s`);
  console.log(`  Passed     : ${passed}/${CONCURRENT_USERS}`);
  console.log(`  Failed     : ${failed}/${CONCURRENT_USERS}`);
  if (failed === 0) {
    console.log(`\n  All good! Workshop ready. 🎉`);
  } else {
    console.log(`\n  ${failed} failed. Check Gemini quota in Google Cloud Console.`);
  }
  console.log(`${'─'.repeat(60)}\n`);
}

run();
