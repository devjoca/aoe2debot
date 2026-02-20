import { getEloHistory } from "../api/insights";
import { getFullStats } from "../api/players";
import { modeLabel, matchTypeForMode, type Mode } from "../constants";
import { formatEloResponse } from "../formatters/elo";
import { parseRequestText } from "../telegram/parsers";
import type { BotContext, CommandContext } from "../telegram/types";
import { startFlow } from "./flow";

export async function handleEloCommand(ctx: CommandContext): Promise<void> {
  const request = parseRequestText(`elo ${ctx.match}`);
  if (!request) {
    await ctx.reply("Usage: /elo <player>");
    return;
  }

  await startFlow(ctx, request);
}

export async function respondWithEloResult(ctx: BotContext, profileId: number, mode: Mode): Promise<void> {
  const label = modeLabel(mode);
  const matchType = matchTypeForMode(mode);

  const [stats, eloHistory] = await Promise.all([
    getFullStats(profileId, matchType),
    getEloHistory(profileId, matchType),
  ]);

  const name = stats.user?.userName ?? `Player ${profileId}`;
  const peakElo = eloHistory && eloHistory.length > 0 ? Math.max(...eloHistory.map((p) => p.y)) : undefined;

  const text = formatEloResponse({
    name,
    profileId,
    modeLabelValue: label,
    elo: stats.user?.elo ?? null,
    totalMatches: stats.mpStatList?.totalMatches ?? 0,
    totalWins: stats.mpStatList?.totalWins ?? 0,
    playerStanding: stats.user?.playerStanding,
    currentWinStreak: stats.mpStatList?.currentWinStreak,
    careerStats: stats.careerStats,
    peakElo,
  });
  await ctx.editMessageText(text, { parse_mode: "HTML" });
}
