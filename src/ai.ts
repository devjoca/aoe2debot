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

async function fetchInsight(
  messages: { role: string; content: string }[],
  key: string,
  model: string,
): Promise<string> {
  console.log("[AI insight] fetching OpenRouter...");
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, stream: false }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "unknown");
    console.error(`[AI insight] OpenRouter API error: ${response.status}`, body.slice(0, 500));
    throw new Error(`OpenRouter API error: ${response.status}`);
  }

  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = json.choices?.[0]?.message?.content ?? "";
  console.log(`[AI insight] got response: ${content.length} chars`);
  return content;
}

export async function sendInsight(
  ctx: BotContext,
  formattedText: string,
  key: string,
  model: string,
): Promise<void> {
  if (!isAiConfigured(key, model)) return;

  const statsText = formattedText
    .replace(/<[^>]+>/g, "")
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
    await ctx.replyWithChatAction("typing");
    const text = await fetchInsight(messages, key, model);
    if (!text.trim()) {
      console.log("[AI insight] empty response, skipping");
      return;
    }

    // Try draft-style delivery (private chats)
    const isPrivateChat = ctx.chat?.type === "private";
    if (isPrivateChat) {
      try {
        await ctx.replyWithDraft(text);
        console.log("[AI insight] sent via draft");
        return;
      } catch (draftError) {
        console.log(
          "[AI insight] draft failed, falling back to reply:",
          draftError instanceof Error ? draftError.message : draftError,
        );
      }
    }

    await ctx.reply(text);
    console.log("[AI insight] sent via reply");
  } catch (err) {
    console.error("[AI insight] error:", err instanceof Error ? err.message : err);
  }
}
