import { sendInsight } from "../ai";
import { decodeIntent, decodeMode } from "../telegram/callbacks";
import { buildModeKeyboard } from "../telegram/keyboards";
import { clampLastCount } from "../telegram/parsers";
import type { CallbackDataContext } from "../telegram/types";
import { respondWithCivsResult } from "./civs";
import { respondWithEloResult } from "./elo";
import { respondWithLastResult } from "./last";
import { respondWithTrendResult } from "./trend";

export interface InsightConfig {
  openrouterKey?: string;
  openrouterModel?: string;
  waitUntil?: (p: Promise<unknown>) => void;
}

export function createHandlePickPlayerCallback(_config: InsightConfig) {
  return async function handlePickPlayerCallback(ctx: CallbackDataContext): Promise<void> {
    const parts = ctx.callbackQuery.data.split("|");
    if (parts.length !== 5) {
      await ctx.answerCallbackQuery({ text: "Invalid selection" });
      return;
    }

    const intent = decodeIntent(parts[2]);
    const count = clampLastCount(parts[3]);
    const profileId = Number.parseInt(parts[4], 10);
    if (!intent || Number.isNaN(profileId)) {
      await ctx.answerCallbackQuery({ text: "Invalid selection" });
      return;
    }

    await ctx.answerCallbackQuery();
    await ctx.editMessageText(`Selected player ${profileId}. Pick ladder:`, {
      reply_markup: buildModeKeyboard(intent, count, profileId),
    });
  };
}

export function createHandlePickModeCallback(config: InsightConfig) {
  return async function handlePickModeCallback(ctx: CallbackDataContext): Promise<void> {
    const parts = ctx.callbackQuery.data.split("|");
    if (parts.length !== 6) {
      await ctx.answerCallbackQuery({ text: "Invalid selection" });
      return;
    }

    const intent = decodeIntent(parts[2]);
    const count = clampLastCount(parts[3]);
    const profileId = Number.parseInt(parts[4], 10);
    const mode = decodeMode(parts[5]);

    if (!intent || Number.isNaN(profileId) || !mode) {
      await ctx.answerCallbackQuery({ text: "Invalid selection" });
      return;
    }

    await ctx.answerCallbackQuery();

    let formattedText = "";
    try {
      if (intent === "elo") {
        formattedText = await respondWithEloResult(ctx, profileId, mode);
      } else if (intent === "trend") {
        formattedText = await respondWithTrendResult(ctx, profileId, mode);
      } else if (intent === "civs") {
        formattedText = await respondWithCivsResult(ctx, profileId, mode);
      } else {
        formattedText = await respondWithLastResult(ctx, profileId, count, mode);
      }
    } catch {
      await ctx.editMessageText("Age2 API request failed. Try again in a moment.");
      return;
    }

    if (formattedText && config.openrouterKey && config.openrouterModel) {
      console.log(`[AI insight] sending for profile ${profileId}, mode ${mode}`);
      const insightPromise = sendInsight(ctx, formattedText, config.openrouterKey, config.openrouterModel).catch((err) => {
        console.error("[AI insight] failed:", err);
      });
      if (config.waitUntil) {
        config.waitUntil(insightPromise);
      }
    } else {
      console.log("[AI insight] skipped —", {
        hasText: Boolean(formattedText),
        hasKey: Boolean(config.openrouterKey),
        hasModel: Boolean(config.openrouterModel),
      });
    }
  };
}
