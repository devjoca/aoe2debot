import { Bot } from "grammy";
import type { UserFromGetMe } from "grammy/types";
import { buildHelpText } from "./formatters";
import { handlePickModeCallback, handlePickPlayerCallback } from "./handlers/common";
import { handleEloCommand } from "./handlers/elo";
import { startFlow } from "./handlers/flow";
import { handleLastCommand } from "./handlers/last";
import { parseMentionRequest } from "./parsers";

function parseBotInfo(botInfo?: string): UserFromGetMe | undefined {
  if (!botInfo || botInfo.trim() === "") {
    return undefined;
  }

  try {
    const parsed = JSON.parse(botInfo);
    if (!parsed || typeof parsed !== "object") {
      console.error("BOT_INFO is not a valid object, ignoring");
      return undefined;
    }
    // Handle full getMe response: {"ok":true,"result":{...}}
    const info = parsed.result ?? parsed;
    if (!info.username) {
      console.error("BOT_INFO is missing 'username' field:", JSON.stringify(info));
      return undefined;
    }
    return info as UserFromGetMe;
  } catch (error) {
    console.error("Failed to parse BOT_INFO:", error);
    return undefined;
  }
}

export function createBot(token: string, botInfo?: string) {
  const parsed = parseBotInfo(botInfo);
  if (!parsed) {
    console.error("BOT_INFO is missing or invalid — commands in groups will fail. Run: curl https://api.telegram.org/bot<TOKEN>/getMe and set the result as BOT_INFO secret.");
  }
  const bot = new Bot(token, {
    ...(parsed ? { botInfo: parsed } : {}),
  });

  bot.catch((err) => {
    console.error("Bot error:", err.message);
  });

  bot.command("start", (ctx) => ctx.reply(`Welcome! Aoede2Bot is running 🎵\n\n${buildHelpText(ctx.me.username ?? "aoede2bot")}`));
  bot.command("help", (ctx) => ctx.reply(buildHelpText(ctx.me.username ?? "aoede2bot")));

  bot.command("elo", handleEloCommand);
  bot.command("last", handleLastCommand);

  bot.callbackQuery(/^a2\|p\|/, handlePickPlayerCallback);
  bot.callbackQuery(/^a2\|m\|/, handlePickModeCallback);

  bot.on("message:text", async (ctx) => {
    if (!ctx.me.username) {
      return;
    }

    const parsed = parseMentionRequest(ctx.message.text, ctx.me.username);
    if (!parsed) {
      return;
    }

    await startFlow(ctx, parsed);
  });

  return bot;
}
