import { InputFile } from "grammy";
import { getEloHistory } from "../api/insights";
import { getFullStats } from "../api/players";
import { buildEloChart } from "../chart";
import { modeLabel, matchTypeForMode, type Mode } from "../constants";
import { parseRequestText } from "../telegram/parsers";
import type { BotContext, CommandContext } from "../telegram/types";
import { startFlow } from "./flow";

export async function handleTrendCommand(ctx: CommandContext): Promise<void> {
  const request = parseRequestText(`trend ${ctx.match}`);
  if (!request) {
    await ctx.reply("Usage: /trend <player>");
    return;
  }

  await startFlow(ctx, request);
}

export async function respondWithTrendResult(ctx: BotContext, profileId: number, mode: Mode): Promise<void> {
  const label = modeLabel(mode);
  const matchType = matchTypeForMode(mode);

  const [stats, eloHistory] = await Promise.all([
    getFullStats(profileId, matchType),
    getEloHistory(profileId, matchType),
  ]);

  const name = stats.user?.userName ?? `Player ${profileId}`;

  if (!eloHistory || eloHistory.length < 2) {
    await ctx.editMessageText(`📈 No ELO history available for ${name} (${label}).`);
    return;
  }

  const chartImage = await buildEloChart(name, label, eloHistory);
  if (!chartImage) {
    await ctx.editMessageText(`📈 Not enough recent data to chart for ${name} (${label}).`);
    return;
  }

  const currentElo = stats.user?.elo;
  const peak = Math.max(...eloHistory.map((point) => point.y));
  const captionParts = [`📈 ${name} — ${label}`];
  if (currentElo !== undefined && currentElo !== null) {
    captionParts.push(`Current: ${currentElo} • Peak: ${peak}`);
  } else {
    captionParts.push(`Peak: ${peak}`);
  }

  // Delete the "pick ladder" message before sending the photo
  try {
    await ctx.deleteMessage();
  } catch {
    // Ignore if we can't delete (e.g. in groups without permission)
  }

  await ctx.replyWithPhoto(new InputFile(chartImage, "trend.png"), {
    caption: captionParts.join("\n"),
  });
}
