import { webhookCallback } from "grammy";
import { createBot } from "./bot";

export interface Env {
  BOT_TOKEN: string;
  BOT_INFO: string;
  OPENROUTER_KEY: string;
  OPENROUTER_MODEL: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return new Response("OK", { status: 200 });
    }

    const bot = createBot(env.BOT_TOKEN, env.BOT_INFO, {
      openrouterKey: env.OPENROUTER_KEY,
      openrouterModel: env.OPENROUTER_MODEL,
      waitUntil: (p: Promise<unknown>) => ctx.waitUntil(p),
    });
    return webhookCallback(bot, "cloudflare-mod")(request);
  },
};
