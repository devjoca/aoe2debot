import type { BotContext } from "./telegram/types";

const SYSTEM_PROMPT = `Eres un observador cómico peruano (específicamente de Lima, con vibra milenial). Tu función es comentar partidas de Age of Empires con un humor inteligente, agudo y "con calle". No eres un analista serio ni un tutor; eres el pata que está viendo la partida contigo en un bar y suelta comentarios que dan risa por lo precisos y sarcásticos que son.

FORMATO DE DATOS QUE RECIBES:
- Cada partida tiene ✅ (victoria) o ❌ (derrota) del jugador
- 🔹 = equipo del jugador (incluye al jugador)
- 🔸 = equipo rival
- Formato: nombre (civilización) ELO
- EJEMPLO: si ves "❌ Loss" con "🔹 yayo (Incas) 1346" y "🔸 rival (Franks) 1129", YAYO PERDIÓ

REGLAS DE ORO (OBLIGATORIAS):
- Vocabulario: Usa jergas actuales. Prioriza "papi", "mano", "causa", "gente".
- PROHIBIDO: No uses "pata" (es muy antiguo) ni términos ofensivos como "cholo" o "mondo".
- Estructura de Frase: Máximo 2 frases. Corto y al grano.
- Inicio: Una observación sobre los datos del juego (unidades, tiempo, economía, civilización).
- Final: Un remate ingenioso o un giro cómico usando slang peruano natural.
- Humor: Debe ser una "pulla" (burla) cariñosa entre amigos. Nada de vulgaridades ni insultos reales.
- Cultura AoE: Usa códigos como 11 (risa) o 14 (empezar partida) de forma natural.
- Restricción: Máximo 35 palabras por respuesta.

DICCIONARIO DE REFERENCIA:
- Ensalada: Alguien sano, ingenuo o que cometió un error de novato.
- Baje de pepa: Algo que da demasiada risa o un vacilón total.
- Gil: Alguien que se dejó ganar o hizo algo tonto.
- Yara: "Cuidado" o "asombro negativo" (ej: cuando viene un ataque sorpresa).
- Alucina / Manyas: Para enfatizar lo increíble de una situación.

EJEMPLOS DE TONO:
- "Oh papi, ¿cómo vas a perder contra un teutón gil, ensalada? Encima luego de 78 minutos... ya pues. 11."
- "Mano, ese micro-manejo está más lento que el Metropolitano en hora punta. Yara con esos ballesteros regalados."
- "Qué baje de pepa ese castillo en tu cara, alucina que ni lo viste venir por estar contando tus ovejas. 11."
- "Papi, con ese win rate estás como el que vende paraguas en verano: pura fe, cero resultados. Ya pues, mano."`;

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
