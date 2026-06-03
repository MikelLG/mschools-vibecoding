import { GoogleGenerativeAI } from '@google/generative-ai';
import { writeFileSync, mkdirSync } from 'fs';

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const EXAMPLES = [
  {
    id: 'example-quiz',
    title: 'Quiz: Emocions a l\'aula',
    prompt: `Ets un expert en disseny d'eines educatives interactives. Crea una aplicació web original i creativa.

Genera un QUIZ INTERACTIU sobre intel·ligència emocional per a alumnes de 4t de primària.
L'objectiu és que els alumnes identifiquin les emocions en situacions quotidianes de l'aula.

Inventa tu mateix 6 situacions originals (no copiades) com:
- "La Maria no ha pogut dormir bé i avui tot li costa més. Quina emoció sent probablement?"
- "En Joan ha acabat el dibuix i li ha quedat molt bé. Com se sent?"
Crea situacions similars sobre: frustració, alegria, nerviosisme, sorpresa, tristesa, orgull.

Tècnicament:
- Un únic fitxer HTML autocontingut (CSS i JS incrustats)
- Disseny colorit i amigable, emojis grans per a les emocions
- Feedback visual i textual per cada resposta
- Puntuació final amb missatge motivador
- Botó de repetir
- Interfície 100% en català
Retorna ÚNICAMENT el codi HTML complet. Comença amb <!DOCTYPE html>.`,
  },
  {
    id: 'example-joc',
    title: 'Joc: Paraules de benvinguda',
    prompt: `Ets un expert en disseny d'eines educatives interactives. Crea una aplicació web original i creativa.

Genera un JOC EDUCATIU de memory per practicar paraules de benvinguda i salutació en 5 idiomes (català, castellà, anglès, francès i àrab) per a alumnes de cicle superior de primària en un context d'escola inclusiva i multicultural.

El joc ha de tenir 10 parelles de cartes: una carta amb l'idioma/país (amb emoji de bandera) i l'altra amb la paraula de salutació corresponent.
Inventa una presentació visual original i atractiva.

Tècnicament:
- Un únic fitxer HTML autocontingut (CSS i JS incrustats)
- Animació de gir de carta suau
- Comptador de parelles trobades i intents
- Missatge de felicitació animat en acabar
- Disseny amb colors càlids, multicultural
- Interfície 100% en català
Retorna ÚNICAMENT el codi HTML complet. Comença amb <!DOCTYPE html>.`,
  },
  {
    id: 'example-rubrica',
    title: 'Rúbrica: Treball en equip',
    prompt: `Ets un expert en disseny d'eines educatives interactives. Crea una aplicació web original i creativa.

Genera una RÚBRICA D'AVALUACIÓ digital i interactiva per avaluar el treball en equip en projectes de recerca per a alumnes de 6è de primària.

Crea 5 criteris originals i específics per al treball cooperatiu:
1. Participació i implicació
2. Escolta activa i respecte
3. Resolució de conflictes
4. Aportació d'idees
5. Responsabilitat amb les tasques assignades

Per a cada criteri, escriu descripcions concretes i observables per a 4 nivells (Insuficient / En procés / Assolit / Excel·lent).

Tècnicament:
- Un únic fitxer HTML autocontingut (CSS i JS incrustats)
- Clic per seleccionar el nivell de cada criteri (ressaltat visual)
- Càlcul automàtic de la puntuació total
- Camp per al nom de l'alumne/a i data
- Botó d'impressió
- Disseny net i professional
- Interfície 100% en català
Retorna ÚNICAMENT el codi HTML complet. Comença amb <!DOCTYPE html>.`,
  },
];

async function generate(example) {
  console.log(`\n⏳ Generant: ${example.title}...`);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent(example.prompt);
  let html = result.response.text()
    .replace(/^```html\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  console.log(`✅ Generat (${html.length} caràcters)`);
  return html;
}

async function main() {
  mkdirSync('./scripts/output', { recursive: true });

  const results = [];
  for (const ex of EXAMPLES) {
    const html = await generate(ex);
    writeFileSync(`./scripts/output/${ex.id}.html`, html, 'utf-8');
    results.push({ ...ex, html });
    // Small delay between requests
    await new Promise(r => setTimeout(r, 2000));
  }

  // Write as JSON file
  const data = results.map(({ id, title, html }) => ({ id, title, html }));
  writeFileSync('./lib/examples.json', JSON.stringify(data, null, 2), 'utf-8');
  console.log('\n✅ Fitxer lib/examples.json creat amb tots els exemples!');
}

main().catch(console.error);
