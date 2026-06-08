import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 240;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

async function generateWithRetry(prompt: string, retries = 3): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const is503 = msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('high demand');
      if (is503 && i < retries - 1) {
        await new Promise(r => setTimeout(r, 3000 * (i + 1)));
        continue;
      }
      if (is503) throw new Error('El model d\'IA està sobrecarregat. Torna-ho a intentar en uns segons.');
      throw err;
    }
  }
  throw new Error('No s\'ha pogut generar el recurs després de diversos intents.');
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
