import { getMatchDetail, getMatchList } from "../api/matches";
import { getFullStats } from "../api/players";
import { SOLO_MATCH_TYPE, modeLabel, matchTypeForMode, type Mode } from "../constants";
import { formatLastResponse } from "../formatters/last";
import { parseRequestText } from "../telegram/parsers";
import type { BotContext, CommandContext } from "../telegram/types";
import { startFlow } from "./flow";

export async function handleLastCommand(ctx: CommandContext): Promise<void> {
  const request = parseRequestText(`last ${ctx.match}`);
  if (!request) {
    await ctx.reply("Usage: /last <player> [count]");
    return;
  }

  await startFlow(ctx, request);
}

function collectUniquePlayerIds(details: Awaited<ReturnType<typeof getMatchDetail>>[]): number[] {
  const seen = new Set<number>();
  for (const detail of details) {
    for (const player of detail.playerList ?? []) {
      const id = Number(player.userId);
      if (!Number.isNaN(id)) seen.add(id);
    }
  }
  return [...seen];
}

async function fetchEloMap(playerIds: number[]): Promise<Map<string, number | null>> {
  const results = await Promise.all(
    playerIds.map(async (id) => {
      const stats = await getFullStats(id, SOLO_MATCH_TYPE);
      return [String(id), stats.user?.elo ?? null] as const;
    }),
  );
  return new Map(results);
}

export async function respondWithLastResult(ctx: BotContext, profileId: number, count: number, mode: Mode): Promise<string> {
  const label = modeLabel(mode);
  const matchType = matchTypeForMode(mode);
  const matchList = await getMatchList(profileId, matchType, count);
  const matches = matchList.matchList ?? [];
  const details = await Promise.all(
    matches
      .map((match) => match.matchId)
      .filter((matchId): matchId is string => Boolean(matchId))
      .map((matchId) => getMatchDetail(profileId, matchId)),
  );

  const playerIds = collectUniquePlayerIds(details);
  const eloMap = await fetchEloMap(playerIds);

  const name = details[0]?.playerList?.find((player) => player.userId === String(profileId))?.userName ?? `Player ${profileId}`;
  const text = formatLastResponse(name, profileId, label, details, eloMap);
  await ctx.editMessageText(text, { parse_mode: "HTML" });
  return text;
}
