import { decodeIntent, decodeMode } from "../telegram/callbacks";
import { buildModeKeyboard } from "../telegram/keyboards";
import { clampLastCount } from "../telegram/parsers";
import type { CallbackDataContext } from "../telegram/types";
import { respondWithEloResult } from "./elo";
import { respondWithLastResult } from "./last";
import { respondWithTrendResult } from "./trend";

export async function handlePickPlayerCallback(ctx: CallbackDataContext): Promise<void> {
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
}

export async function handlePickModeCallback(ctx: CallbackDataContext): Promise<void> {
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
  try {
    if (intent === "elo") {
      await respondWithEloResult(ctx, profileId, mode);
      return;
    }

    if (intent === "trend") {
      await respondWithTrendResult(ctx, profileId, mode);
      return;
    }

    await respondWithLastResult(ctx, profileId, count, mode);
  } catch {
    await ctx.editMessageText("Age2 API request failed. Try again in a moment.");
  }
}
