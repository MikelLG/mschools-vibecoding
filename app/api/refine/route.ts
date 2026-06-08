import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 240;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const MODEL_CASCADE = ['gemini-2.5-flash', 'gemini-2.0-flash-lite'];

async function generateWithRetry(prompt: string): Promise<string> {
  for (const modelName of MODEL_CASCADE) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const isRetryable =
        msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('high demand') ||
        msg.includes('429') || msg.includes('Too Many Requests') || msg.includes('quota') ||
        msg.includes('404') || msg.includes('no longer available') || msg.includes('deprecated');
      if (isRetryable) continue;
      throw err;
    }
  }
  throw new Error('Tots els models estan sobrecarregats. Torna-ho a intentar en uns minuts.');
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
