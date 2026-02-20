import type { Context } from "grammy";

export type BotContext = Context;

export type CommandContext = BotContext & {
  match: string;
};

export type CallbackDataContext = BotContext & {
  callbackQuery: {
    data: string;
  };
};
