import type { Bot } from "grammy";

const privateCommands = [
  { command: "start", description: "Start the bot" },
  { command: "help", description: "Show help and examples" },
  { command: "elo", description: "Show ELO for a player" },
  { command: "last", description: "Show recent matches" },
  { command: "trend", description: "Show ELO trend chart" },
] as const;

const groupCommands = [
  { command: "elo", description: "Show ELO for a player" },
  { command: "last", description: "Show recent matches" },
  { command: "trend", description: "Show ELO trend chart" },
] as const;

export async function setCommands(bot: Bot) {
  await Promise.all([
    bot.api.setMyCommands(privateCommands, {
      scope: { type: "all_private_chats" },
    }),
    bot.api.setMyCommands(groupCommands, {
      scope: { type: "all_group_chats" },
    }),
  ]);
}
