import { InlineKeyboard } from "grammy";
import type { Intent } from "../constants";
import { encodePickMode } from "./callbacks";

export function buildModeKeyboard(intent: Intent, count: number, profileId: number): InlineKeyboard {
  return new InlineKeyboard()
    .text("Team Random", encodePickMode(intent, count, profileId, "team"))
    .text("1v1", encodePickMode(intent, count, profileId, "solo"));
}
