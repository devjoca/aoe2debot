import { webhookCallback } from "grammy";
import { createBot } from "./bot";

export interface Env {
  BOT_TOKEN: string;
  BOT_INFO: string;
  AI: Ai;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return new Response("OK", { status: 200 });
    }

    const bot = createBot(env.BOT_TOKEN, env.BOT_INFO, {
      ai: env.AI,
      waitUntil: (p) => ctx.waitUntil(p),
    });
    return webhookCallback(bot, "cloudflare-mod")(request);
  },
};
