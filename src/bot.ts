import { Bot } from "grammy";

export function createBot(token: string, botInfo?: string) {
  const bot = new Bot(token, {
    botInfo: botInfo ? JSON.parse(botInfo) : undefined,
  });

  bot.command("start", (ctx) => ctx.reply("Welcome! Aoede2Bot is running 🎵"));

  bot.on("message:text", (ctx) => ctx.reply(`You said: ${ctx.message.text}`));

  return bot;
}
