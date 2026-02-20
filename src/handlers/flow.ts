import { InlineKeyboard } from "grammy";
import { getFullStats, searchPlayers, type LeaderboardItem } from "../age2";
import { buildModeKeyboard, encodePickPlayer } from "../callbacks";
import { SOLO_MATCH_TYPE, TEAM_MATCH_TYPE, type ParsedRequest } from "../constants";
import type { BotContext } from "../types";

async function resolvePlayers(query: string): Promise<LeaderboardItem[]> {
  if (/^\d+$/.test(query)) {
    const profileId = Number.parseInt(query, 10);
    const [teamStats, soloStats] = await Promise.all([
      getFullStats(profileId, TEAM_MATCH_TYPE),
      getFullStats(profileId, SOLO_MATCH_TYPE),
    ]);
    const stats = teamStats.user?.userName ? teamStats : soloStats.user?.userName ? soloStats : teamStats;
    const name = stats.user?.userName ?? query;
    const elo = stats.user?.elo ?? soloStats.user?.elo ?? teamStats.user?.elo ?? null;
    return [{ rlUserId: profileId, userName: name, elo }];
  }

  return await searchPlayers(query);
}

export async function startFlow(ctx: BotContext, request: ParsedRequest): Promise<void> {
  const candidates = await resolvePlayers(request.query);
  if (candidates.length === 0) {
    await ctx.reply(`No player found for "${request.query}".`);
    return;
  }

  if (candidates.length === 1) {
    const player = candidates[0];
    await ctx.reply(
      `Selected ${player.userName} (${player.rlUserId}). Pick ladder:`,
      { reply_markup: buildModeKeyboard(request.intent, request.count, player.rlUserId) },
    );
    return;
  }

  const keyboard = new InlineKeyboard();
  candidates.slice(0, 3).forEach((candidate) => {
    keyboard.text(`${candidate.userName} (${candidate.rlUserId})`, encodePickPlayer(request.intent, request.count, candidate.rlUserId));
    keyboard.row();
  });
  await ctx.reply("Pick a player:", { reply_markup: keyboard });
}
