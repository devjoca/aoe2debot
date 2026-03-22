import { getMatchList } from "../api/matches";
import { getFullStats } from "../api/players";
import { modeLabel, matchTypeForMode, type Mode } from "../constants";
import { formatCivsResponse } from "../formatters/civs";
import { parseRequestText } from "../telegram/parsers";
import type { BotContext, CommandContext } from "../telegram/types";
import { startFlow } from "./flow";

const CIVS_MATCH_COUNT = 50;

export async function handleCivsCommand(ctx: CommandContext): Promise<void> {
  const request = parseRequestText(`civs ${ctx.match}`);
  if (!request) {
    await ctx.reply("Usage: /civs <player>");
    return;
  }

  await startFlow(ctx, request);
}

export async function respondWithCivsResult(ctx: BotContext, profileId: number, mode: Mode): Promise<string> {
  const label = modeLabel(mode);
  const matchType = matchTypeForMode(mode);

  const [stats, matchList] = await Promise.all([
    getFullStats(profileId, matchType),
    getMatchList(profileId, matchType, CIVS_MATCH_COUNT),
  ]);

  const name = stats.user?.userName ?? `Player ${profileId}`;
  const matches = matchList.matchList ?? [];
  const text = formatCivsResponse(name, profileId, label, matches);
  await ctx.editMessageText(text, { parse_mode: "HTML" });
  return text;
}
