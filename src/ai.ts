import type { BotContext } from "./telegram/types";

const SYSTEM_PROMPT = `Eres un comentarista peruano de Age of Empires 2 con humor astuto y observador. Eres como ese amigo gracioso que te mira las stats y no puede evitar hacer un comentario picante pero con cariño.

FORMATO DE DATOS QUE RECIBES:
- Cada partida tiene ✅ (victoria) o ❌ (derrota) del jugador
- 🔹 = equipo del jugador (incluye al jugador)
- 🔸 = equipo rival
- Formato: nombre (civilización) ELO
- EJEMPLO: si ves "❌ Loss" con "🔹 yayo (Incas) 1346" y "🔸 rival (Franks) 1129", YAYO PERDIÓ

REGLAS:
- Español latino, coloquial peruano sutil (acento neutro con toques limeños)
- 1-2 frases, máximo. Corto y al hueso
- Empieza con una observación sobre los datos, termina con un remate o giro ingenioso
- Humor inteligente: observaciones agudas, no chistes obvios. Como un comentario de bar con amigos
- Usa slang peruano natural: causa, pata, hermano, bacán, chévere, pe, ya pues
- Evita "cholo", "mondo", o términos que puedan sonar ofensivos
- NUNCA seas vulgar ni insultante. Tu humor es como una pulla cariñosa entre amigos
- NUNCA des consejos de juego ni análisis serio. Eres pura observación cómica
- Máximo 35 palabras. Un golpe seco y listo

EJEMPLOS DE TONO:
- "Pata, con ese win rate estás como el que vende paraguas en verano: pura fe, cero resultados."
- "Ese ELO sube y baja más que la gasolina en Lima. Pero al menos tú no te rindes, causa."
- "60% de victorias con los Mongoles... ya pues, deja algo para los demás, que no todos nacieron en la estepa."`;

const MAX_STATS_LENGTH = 500;

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .slice(0, MAX_STATS_LENGTH);
}

export async function sendInsight(
  ctx: BotContext,
  formattedText: string,
  key: string,
  model: string,
): Promise<void> {
  const statsText = stripHtml(formattedText);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://aoede2bot.jpereyraleon.workers.dev",
        "X-Title": "aoede2bot",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: statsText },
        ],
        max_tokens: 1000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "unknown");
      console.error("[AI insight] OpenRouter error:", response.status, body.slice(0, 200));
      return;
    }

    const rawText = await response.text();
    if (!rawText) return;

    let json: { choices?: { message?: { content?: string } }[] };
    try {
      json = JSON.parse(rawText);
    } catch {
      console.error("[AI insight] invalid JSON:", rawText.slice(0, 200));
      return;
    }

    const choice = json.choices?.[0] as {
      message?: { content?: string; reasoning?: string };
    } | undefined;
    const raw = choice?.message?.content ?? choice?.message?.reasoning ?? "";

    // Nemotron puts the answer in quotes inside the reasoning field
    const quoted = raw.match(/"([^"]{10,})"/);
    const text = (quoted ? quoted[1] : raw).trim();

    if (text) {
      await ctx.reply(text);
    }
  } catch (err) {
    console.error("[AI insight] error:", err instanceof Error ? err.message : err);
  }
}
