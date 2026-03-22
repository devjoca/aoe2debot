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

export async function sendInsight(
  ctx: BotContext,
  formattedText: string,
  ai: Ai,
): Promise<void> {
  const statsText = formattedText
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .slice(0, MAX_STATS_LENGTH);

  try {
    console.log("[AI insight] calling Workers AI...");
    const response = await ai.run("@cf/meta/llama-3.1-8b-instruct" as keyof AiModels, {
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: statsText },
      ],
      stream: false,
    });

    const text = (response as { response?: string }).response?.trim();
    if (!text) {
      console.log("[AI insight] empty response");
      return;
    }

    await ctx.reply(text);
    console.log(`[AI insight] sent, ${text.length} chars`);
  } catch (err) {
    console.error("[AI insight] error:", err instanceof Error ? err.message : err);
  }
}
