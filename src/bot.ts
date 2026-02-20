import { Bot } from "grammy";
import { parseBotInfo } from "./config";
import { buildHelpText } from "./formatters/help";
import { handlePickModeCallback, handlePickPlayerCallback } from "./handlers/callbacks";
import { handleEloCommand } from "./handlers/elo";
import { startFlow } from "./handlers/flow";
import { handleLastCommand } from "./handlers/last";
import { handleTrendCommand } from "./handlers/trend";
import { parseMentionRequest } from "./telegram/parsers";

export function createBot(token: string, botInfo?: string) {
  const parsed = parseBotInfo(botInfo);
  if (!parsed) {
    console.error("BOT_INFO is missing or invalid — commands in groups will fail. Run: curl https://api.telegram.org/bot<TOKEN>/getMe and set the result as BOT_INFO secret.");
  }
  const bot = new Bot(token, {
    ...(parsed ? { botInfo: parsed } : {}),
  });

  bot.catch(async (err) => {
    console.error("Bot error:", err.message);
    const isTimeout = err.message?.includes("timed out") || err.message?.includes("abort");
    const text = isTimeout
      ? "⏳ The AoE2 API is taking too long to respond. Please try again later."
      : "⚠️ Something went wrong. Please try again later.";
    try {
      await err.ctx.reply(text);
    } catch {
      // best-effort reply
    }
  });

  bot.command("start", (ctx) => ctx.reply(`Welcome! Aoede2Bot is running 🎵\n\n${buildHelpText(ctx.me.username ?? "aoede2bot")}`));
  bot.command("help", (ctx) => ctx.reply(buildHelpText(ctx.me.username ?? "aoede2bot")));

  bot.command("elo", handleEloCommand);
  bot.command("last", handleLastCommand);
  bot.command("trend", handleTrendCommand);

  bot.callbackQuery(/^a2\|p\|/, handlePickPlayerCallback);
  bot.callbackQuery(/^a2\|m\|/, handlePickModeCallback);

  bot.on("message:text", async (ctx) => {
    if (!ctx.me.username) {
      return;
    }

    const mention = parseMentionRequest(ctx.message.text, ctx.me.username);
    if (!mention) {
      return;
    }

    await startFlow(ctx, mention);
  });

  return bot;
}
