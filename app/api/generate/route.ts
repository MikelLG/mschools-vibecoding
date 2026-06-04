import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

function generateId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { selectedCards, promptPreview, voicePrompt, extraContext, format, formatLabel, pairName, sessionId } = body;

    const prompt = buildPrompt({ selectedCards, promptPreview, voicePrompt, extraContext, formatLabel, format });

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    let htmlOutput = result.response.text();

    htmlOutput = htmlOutput
      .replace(/^```html\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const id = generateId();
    const submission = {
      id,
      stationId: 1,
      pairName: pairName ?? '',
      rol: '', rolLabel: selectedCards?.find((c: {group:string}) => c.group === 'Usuari final')?.value ?? '',
      contextTheme: selectedCards?.find((c: {group:string}) => c.group === 'Eix')?.value ?? '',
      contextThemeLabel: selectedCards?.find((c: {group:string}) => c.group === 'Eix')?.value ?? '',
      contextDescription: extraContext ?? '',
      tasca: promptPreview ?? '',
      format,
      formatLabel,
      prompt,
      htmlOutput,
      createdAt: Date.now(),
      sessionId: sessionId ?? process.env.NEXT_PUBLIC_SESSION_ID ?? 'default',
    };

    return NextResponse.json({ submission });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[generate]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

const FORMAT_INSTRUCTIONS: Record<string, string> = {
  quiz: `Crea un QUIZ INTERACTIU amb:
- Mínim 6 preguntes de resposta múltiple (4 opcions cadascuna)
- Feedback immediat per resposta (✅ correcte / ❌ incorrecte + explicació breu)
- Barra de progrés visible
- Puntuació final amb missatge personalitzat segons el resultat
- Botó per repetir el quiz`,

  activitat: `Crea una ACTIVITAT INTERACTIVA per a l'aula amb:
- Instruccions clares a la part superior
- Mínim 3 exercicis o tasques interactives (arrossegar, completar, relacionar o marcar)
- Feedback visual per a cada exercici
- Botó "Comprovar" o "Següent" entre exercicis
- Resum dels resultats al final`,

  rubrica: `Crea una RÚBRICA D'AVALUACIÓ digital amb:
- Mínim 5 criteris d'avaluació rellevants per al context
- 4 nivells per criteri: Insuficient (1) / Suficient (2) / Notable (3) / Excel·lent (4)
- Descripció clara i específica per a cada cel·la
- Sistema de clic per seleccionar el nivell de cada criteri (resaltat visual en verd)
- Càlcul automàtic de la puntuació total i nota final
- Botó per imprimir o copiar l'avaluació`,

  formulari: `Crea un FORMULARI INTERACTIU amb:
- Camps ben organitzats per seccions amb títols
- Validació de camps obligatoris amb missatge d'error clar
- Mínim 5-8 camps (text, opcions, escala valoració, etc.) rellevants per al context
- Vista prèvia del formulari omplert abans d'enviar
- Pantalla de confirmació animada en enviar ("S'ha enviat correctament ✅")
- Opció de copiar el contingut al portapapers`,

  joc: `Crea un JOC EDUCATIU interactiu amb:
- Mecànica de joc clara i temàtica (no genèrica)
- Sistema de puntuació visible i actualitzat en temps real
- Mínim 3 nivells o rondes de dificultat creixent
- Efectes visuals i sonors (amb Web Audio API si cal) per a encerts i errors
- Temporitzador si escau
- Pantalla de fi de joc amb puntuació i opció de repetir`,

  suport: `Crea un MATERIAL DE SUPORT visual i interactiu amb:
- Contingut organitzat en seccions clares amb icones
- Mínim 3 apartats amb informació rellevant i pràctica
- Elements interactius: acordions desplegables, pestanyes o carrusel de contingut
- Checklist interactiva o llista de verificació que es pot marcar
- Opció d'imprimir o guardar en PDF (window.print())
- Disseny tipus infografia o guia visual`,
};

function buildPrompt({
  selectedCards, promptPreview, voicePrompt, extraContext, formatLabel, format,
}: {
  selectedCards: Array<{ group: string; value: string }>;
  promptPreview: string; voicePrompt?: string; extraContext: string; formatLabel: string; format: string;
}) {
  const formatInstructions = FORMAT_INSTRUCTIONS[format] ?? `Crea una eina de tipus "${formatLabel}" adequada per al context.`;

  const contextSection = voicePrompt
    ? `## DESCRIPCIÓ DEL DOCENT (per veu)\n"${voicePrompt}"${extraContext ? `\n\nContext addicional: ${extraContext}` : ''}`
    : `## CONTEXT (construït a partir de targetes)\n${selectedCards.map(c => `- **${c.group}**: ${c.value}`).join('\n')}${extraContext ? `\n- **Context addicional**: ${extraContext}` : ''}`;

  return `Ets un expert en disseny d'aplicacions educatives web per a l'escola catalana. La teva especialitat és crear eines digitals interactives, visualment atractives i 100% funcionals per a docents.

${contextSection}

## PROMPT COMPLET
Crea una eina educativa per a ${promptPreview}.${extraContext ? ` ${extraContext}` : ''}

## QUÈ HAS DE CREAR
${formatInstructions}

## REQUISITS TÈCNICS OBLIGATORIS
1. **Un únic fitxer HTML** complet i autocontingut — sense CDN, sense imports externs
2. **CSS i JS incrustats** — tot dins el mateix fitxer HTML
3. **Disseny professional**: usa variables CSS, flexbox/grid, transicions suaus, ombres subtils
4. **Paleta de colors coherent**: tria 2-3 colors principals i usa'ls de forma consistent
5. **Tipografia llegible**: font-size mínim 16px, contrast alt, espaiats generosos
6. **100% en català** — tota la interfície, instruccions i continguts
7. **Mobile-friendly**: funciona bé en pantalles de tauleta i mòbil

## REQUISITS DE QUALITAT
- El contingut ha de ser específic i rellevant per al repte descrit, NO genèric
- La interactivitat ha de ser real i significativa (no decorativa)
- Ha d'incloure un títol descriptiu i clar a la capçalera
- Ha de tenir un aspecte professional que un docent voldria usar a classe
- Afegeix icones emoji per fer-ho més visual i amigable

## FORMAT DE RESPOSTA
Retorna ÚNICAMENT el codi HTML. Sense explicacions. Sense markdown. Comença directament amb <!DOCTYPE html> i acaba amb </html>.`;
}
