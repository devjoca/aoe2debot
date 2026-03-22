import type { Context } from "grammy";
import type { StreamFlavor } from "@grammyjs/stream";

export type BotContext = StreamFlavor<Context>;

export type CommandContext = BotContext & {
  match: string;
};

export type CallbackDataContext = BotContext & {
  callbackQuery: {
    data: string;
  };
};
