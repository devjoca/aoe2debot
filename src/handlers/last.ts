import { getMatchDetail, getMatchList } from "../api/matches";
import { modeLabel, matchTypeForMode, type Mode } from "../constants";
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

export async function respondWithLastResult(ctx: BotContext, profileId: number, count: number, mode: Mode): Promise<void> {
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
  const name = details[0]?.playerList?.find((player) => player.userId === String(profileId))?.userName ?? `Player ${profileId}`;
  const text = formatLastResponse(name, profileId, label, details);
  await ctx.editMessageText(text, { parse_mode: "HTML" });
}
