import { Bot } from "grammy";
import type { UserFromGetMe } from "grammy/types";
import { buildHelpText } from "./formatters";
import { handlePickModeCallback, handlePickPlayerCallback } from "./handlers/common";
import { handleEloCommand } from "./handlers/elo";
import { startFlow } from "./handlers/flow";
import { handleLastCommand } from "./handlers/last";
import { parseMentionRequest } from "./parsers";

function parseBotInfo(botInfo?: string): UserFromGetMe | undefined {
  if (!botInfo) {
    return undefined;
  }

  try {
    return JSON.parse(botInfo) as UserFromGetMe;
  } catch {
    throw new Error("Invalid BOT_INFO JSON. Expected the raw getMe JSON string.");
  }
}

export function createBot(token: string, botInfo?: string) {
  const bot = new Bot(token, {
    botInfo: parseBotInfo(botInfo),
  });

  bot.command("start", (ctx) => ctx.reply(`Welcome! Aoede2Bot is running 🎵\n\n${buildHelpText(ctx.me.username)}`));
  bot.command("help", (ctx) => ctx.reply(buildHelpText(ctx.me.username)));

  bot.command("elo", handleEloCommand);
  bot.command("last", handleLastCommand);

  bot.callbackQuery(/^a2\|p\|/, handlePickPlayerCallback);
  bot.callbackQuery(/^a2\|m\|/, handlePickModeCallback);

  bot.on("message:text", async (ctx) => {
    const parsed = parseMentionRequest(ctx.message.text, ctx.me.username);
    if (!parsed) {
      return;
    }

    await startFlow(ctx, parsed);
  });

  return bot;
}
