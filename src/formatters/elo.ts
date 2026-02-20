import type { CareerStats } from "../api/types";
import { escapeHtml, formatNumber, formatWinRate, modeEmoji } from "./shared";

function formatStanding(playerStanding: number | undefined): string {
  if (playerStanding === undefined || playerStanding <= 0) {
    return "";
  }

  const percent = Math.round(playerStanding * 100);
  return ` • Top ${percent}%`;
}

function formatWinStreak(streak: number | undefined): string {
  if (streak === undefined || streak === 0) {
    return "";
  }

  if (streak > 0) {
    return ` • 🔥 ${streak} win streak`;
  }

  return ` • 🥶 ${Math.abs(streak)} loss streak`;
}

function formatCareerStats(career: CareerStats): string[] {
  const lines: string[] = [""];

  lines.push(
    `⚔️ <b>Units*</b>`,
    `   Destroyed: ${formatNumber(career.unitsKilled ?? 0)} • Lost: ${formatNumber(career.unitsLost ?? 0)}`,
  );

  lines.push(
    `🏰 <b>Buildings*</b>`,
    `   Razed: ${formatNumber(career.buildingsRaised ?? 0)} • Lost: ${formatNumber(career.buildingsLost ?? 0)}`,
  );

  const constructs = [
    `Wonders: ${formatNumber(career.wondersBuilt ?? 0)}`,
    `Castles: ${formatNumber(career.castlesBuilt ?? 0)}`,
    `Trebs: ${formatNumber(career.trebsBuilt ?? 0)}`,
    `Farms: ${formatNumber(career.farmsBuilt ?? 0)}`,
  ].join(" • ");
  lines.push(`🏗️ <b>Constructs*</b>`, `   ${constructs}`);

  lines.push(
    `🏆 <b>High Scores</b>`,
    `   🗡️ ${formatNumber(career.highScoreMilitary ?? 0)} • 💰 ${formatNumber(career.highScoreEconomy ?? 0)} • 🔬 ${formatNumber(career.highScoreTechnology ?? 0)}`,
  );

  lines.push("", `<i>* includes singleplayer and multiplayer data</i>`);

  return lines;
}

export interface EloResponseParams {
  name: string;
  profileId: number;
  modeLabelValue: string;
  elo: number | null;
  totalMatches: number;
  totalWins: number;
  playerStanding?: number;
  currentWinStreak?: number;
  careerStats?: CareerStats;
  peakElo?: number;
}

export function formatEloResponse(params: EloResponseParams): string {
  const { name, profileId, modeLabelValue, elo, totalMatches, totalWins, playerStanding, currentWinStreak, careerStats, peakElo } = params;
  const safeName = escapeHtml(name);
  const safeMode = escapeHtml(modeLabelValue);
  const ladderEmoji = modeEmoji(modeLabelValue);

  if (elo === null) {
    return [
      `👤 <b>${safeName}</b> <code>(${profileId})</code>`,
      `${ladderEmoji} <b>${safeMode}</b>`,
      "📈 No ranked data yet",
    ].join("\n");
  }

  const losses = Math.max(0, totalMatches - totalWins);
  const winRate = formatWinRate(totalMatches, totalWins);
  const standing = formatStanding(playerStanding);
  const streak = formatWinStreak(currentWinStreak);

  const lines = [
    `👤 <b>${safeName}</b> <code>(${profileId})</code>`,
    `${ladderEmoji} <b>${safeMode}</b>`,
    `📈 <b>${elo}</b> ELO${standing}${peakElo !== undefined ? ` • 🏔️ Peak: ${peakElo}` : ""}`,
    `📊 <b>${totalWins}-${losses}</b> • ${totalMatches} games • ${winRate}% WR${streak}`,
  ];

  if (careerStats) {
    lines.push(...formatCareerStats(careerStats));
  }

  return lines.join("\n");
}
