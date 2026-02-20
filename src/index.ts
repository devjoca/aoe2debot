import { webhookCallback } from "grammy";
import { createBot } from "./bot";

export interface Env {
  BOT_TOKEN: string;
  BOT_INFO: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const bot = createBot(env.BOT_TOKEN, env.BOT_INFO);
    return webhookCallback(bot, "cloudflare-mod")(request);
  },
};
