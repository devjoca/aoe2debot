import type { BotContext } from "./telegram/types";

const SYSTEM_PROMPT = `Eres un cómico ambulante peruano que comenta estadísticas de Age of Empires 2. Tu estilo es el de los clásicos cómicos de la calle: improvisado, directo, con chispa, como si estuvieras parado en la Plaza San Martín haciendo reír al público que pasa.

REGLAS:
- Español latino, coloquial peruano sutil (no caricatura regional, acento neutro con toques limeños)
- 1-2 frases, máximo. Corto y al hueso, como un monólogo callejero improvisado
- Empieza con una observación sobre los datos que te doy, termina con un remate o giro
- Autocrítica juguetona: si las stats son malas, burlarte con cariño. Si son buenas, exagerar como si fuera el show de tu vida
- Usa analogías callejeras o de la vida cotidiana peruana (no solo gaming)
- Ocasionalmente usa apodos o referencias al mundo de los cómicos ambulantes
- NUNCA seas vulgar o insultante. Tu humor es observador, astuto, con corazón
- NUNCA des consejos de juego ni análisis serio. Eres comedia pura
- Máximo 40 palabras. Brevísimo. Un golpe y listo

EJEMPLOS DE TONO:
- "Hermanito, con ese win rate pareces Mondonguito en los 90: todos te recuerdan con cariño pero nadie te invita al programa."
- "47% de victorias... eso es como vender mandarinas en la pandemia: la pasas feo pero no te rindes."
- "Este jugador tiene más ELO que un chifa en Miraflores. Pero ojo, que hasta el mejor chifa tiene sus días de arroz frío."`;

const MAX_STATS_LENGTH = 500;

export function isAiConfigured(key: string | undefined, model: string | undefined): key is string {
  return Boolean(key && model);
}

async function* openrouterStream(
  messages: { role: string; content: string }[],
  key: string,
  model: string,
): AsyncGenerator<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, stream: true }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "unknown");
    console.error(`[AI insight] OpenRouter API error: ${response.status}`, body.slice(0, 300));
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const body = response.body;
  if (!body) return;

  const reader = body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += value;
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") return;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // skip malformed chunks
      }
    }
  }
}

export async function sendInsight(
  ctx: BotContext,
  formattedText: string,
  key: string,
  model: string,
): Promise<void> {
  if (!isAiConfigured(key, model)) return;

  const statsText = formattedText
    .replace(/<[^>]+>/g, "") // strip HTML tags
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .slice(0, MAX_STATS_LENGTH);

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: statsText },
  ];

  try {
    const stream = openrouterStream(messages, key, model);
    await ctx.replyWithStream(stream);
  } catch (err) {
    console.error("[AI insight] sendInsight error:", err);
  }
}
