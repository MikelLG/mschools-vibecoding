import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 240;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const MODEL_CASCADE = [
  'gemini-3.5-flash',
  'gemini-3.1-pro',
  'gemini-3-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
];

function isRetryableError(msg: string) {
  return (
    msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('high demand') ||
    msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('quota') ||
    msg.includes('404') || msg.includes('no longer available') || msg.includes('deprecated') ||
    msg.includes('overloaded') || msg.includes('RESOURCE_EXHAUSTED')
  );
}

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function generateWithRetry(prompt: string, maxRounds = 6): Promise<string> {
  for (let round = 0; round < maxRounds; round++) {
    for (let i = 0; i < MODEL_CASCADE.length; i++) {
      try {
        const model = genAI.getGenerativeModel({ model: MODEL_CASCADE[i] });
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (isRetryableError(msg)) {
          await sleep(i < MODEL_CASCADE.length - 1 ? 1500 : 5000);
          continue;
        }
        throw err;
      }
    }
  }
  throw new Error('OVERLOADED');
}

export async function POST(req: NextRequest) {
  try {
    const { existingHtml, refinementText } = await req.json();

    const prompt = `Tens una aplicació web educativa en HTML. L'usuari vol millorar-la amb instruccions específiques.

## APLICACIÓ ACTUAL
${existingHtml}

## MILLORES SOL·LICITADES
${refinementText}

## INSTRUCCIONS
Modifica l'HTML per incorporar exactament les millores sol·licitades.
Mantén tot el contingut i la funcionalitat existents tret que s'indiqui el contrari.
Millora el disseny, funcionalitat o contingut segons s'especifica.
El resultat ha de ser un únic fitxer HTML complet i autocontingut, 100% en català.

## FORMAT DE RESPOSTA
Retorna ÚNICAMENT el codi HTML complet modificat. Sense explicacions. Comença directament amb <!DOCTYPE html> i acaba amb </html>.`;

    let htmlOutput = await generateWithRetry(prompt);

    htmlOutput = htmlOutput
      .replace(/^```html\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    return NextResponse.json({ htmlOutput });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[refine]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
