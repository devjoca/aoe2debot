import type { CareerStats, MatchDetailResponse } from "./age2";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatWinRate(totalMatches: number, totalWins: number): string {
  if (totalMatches <= 0) {
    return "0.0";
  }

  return ((totalWins / totalMatches) * 100).toFixed(1);
}

function modeEmoji(modeLabelValue: string): string {
  return modeLabelValue === "1v1" ? "⚔️" : "🏆";
}

function resultEmoji(result: string): string {
  if (result.toLowerCase() === "win") {
    return "✅";
  }

  if (result.toLowerCase() === "loss") {
    return "❌";
  }

  return "▫️";
}

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

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
}

export function formatEloResponse(params: EloResponseParams): string {
  const { name, profileId, modeLabelValue, elo, totalMatches, totalWins, playerStanding, currentWinStreak, careerStats } = params;
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
    `📈 <b>${elo}</b> ELO${standing}`,
    `📊 <b>${totalWins}-${losses}</b> • ${totalMatches} games • ${winRate}% WR${streak}`,
  ];

  if (careerStats) {
    lines.push(...formatCareerStats(careerStats));
  }

  return lines.join("\n");
}

function formatTeams(detail: MatchDetailResponse): string[] {
  const byTeam = new Map<number, string[]>();
  for (const player of detail.playerList ?? []) {
    const team = player.team ?? 0;
    const name = player.userName ?? "Unknown";
    const civ = player.civName ?? "Unknown civ";
    const existing = byTeam.get(team) ?? [];
    existing.push(`${name} (${civ})`);
    byTeam.set(team, existing);
  }

  return [...byTeam.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, players], index) => `${index === 0 ? "🔹" : "🔸"} ${players.join(", ")}`);
}

function formatDate(raw: string): string {
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}:\d{2})/);
  if (!match) {
    return raw;
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = Number.parseInt(match[3], 10);
  const month = months[Number.parseInt(match[2], 10) - 1];
  const time = match[4];
  return `${day} ${month} ${time}`;
}

export function formatLastResponse(name: string, profileId: number, modeLabelValue: string, details: MatchDetailResponse[]): string {
  const safeName = escapeHtml(name);
  const safeMode = escapeHtml(modeLabelValue);
  const ladderEmoji = modeEmoji(modeLabelValue);

  if (details.length === 0) {
    return [
      `👤 <b>${safeName}</b> <code>(${profileId})</code>`,
      `${ladderEmoji} <b>${safeMode}</b>`,
      "🗺️ No recent matches found",
    ].join("\n");
  }

  const chunks: string[] = [
    `👤 <b>${safeName}</b> <code>(${profileId})</code>`,
    `${ladderEmoji} <b>${safeMode}</b> recent matches`,
  ];

  for (const detail of details) {
    const summary = detail.matchSummary;
    const date = formatDate(summary?.dateTime ?? "");
    const map = escapeHtml(summary?.mapType ?? "Unknown map");
    const duration = summary?.matchLength !== undefined ? `${Math.round(summary.matchLength)}m` : "?m";
    const self = (detail.playerList ?? []).find((player) => player.userId === String(profileId));
    const result = self?.winLoss ?? "Unknown";
    const safeResult = escapeHtml(result);

    chunks.push("");
    chunks.push(`${resultEmoji(result)} <b>${safeResult}</b> • ${map} • ${duration} • ${date}`);
    chunks.push(...formatTeams(detail).map((line) => `  ${escapeHtml(line)}`));
  }

  return chunks.join("\n");
}

export function buildHelpText(botUsername: string): string {
  return [
    "Aoede2Bot commands:",
    "/elo <player> - pick Team Random or 1v1, then show ELO",
    "/last <player> [count] - pick Team Random or 1v1, then show recent matches",
    "",
    "Group mention examples:",
    `@${botUsername} elo yayo`,
    `@${botUsername} last yayo`,
    `@${botUsername} last yayo 5`,
    "",
    "Notes:",
    "- If player name is ambiguous, you pick the correct one",
    "- For /last, count defaults to 5 (max 5)",
  ].join("\n");
}
