import type { MatchListResponse } from "../api/types";
import { escapeHtml, formatWinRate, modeEmoji } from "./shared";

interface CivStats {
  name: string;
  games: number;
  wins: number;
}

function aggregateCivStats(matches: NonNullable<MatchListResponse["matchList"]>): CivStats[] {
  const stats = new Map<string, { games: number; wins: number }>();

  for (const match of matches) {
    const civ = match.civilization?.trim() ?? "Unknown";
    const entry = stats.get(civ) ?? { games: 0, wins: 0 };
    entry.games++;
    if (match.winLoss === "Win") entry.wins++;
    stats.set(civ, entry);
  }

  return [...stats.entries()]
    .map(([name, { games, wins }]) => ({ name, games, wins }))
    .sort((a, b) => b.games - a.games || b.wins - a.wins);
}

function formatCivLine(stat: CivStats, maxNameLen: number): string {
  const name = stat.name.padEnd(maxNameLen);
  const count = stat.games === 1 ? "1 game " : `${stat.games} games`;
  const wr = formatWinRate(stat.games, stat.wins);
  return `<code>${escapeHtml(name)}</code>  ${count}  ${wr}% WR`;
}

export function formatCivsResponse(name: string, profileId: number, modeLabelValue: string, matches: NonNullable<MatchListResponse["matchList"]>): string {
  const safeName = escapeHtml(name);
  const safeMode = escapeHtml(modeLabelValue);
  const ladderEmoji = modeEmoji(modeLabelValue);

  if (matches.length === 0) {
    return [
      `\u{1F464} <b>${safeName}</b> <code>(${profileId})</code>`,
      `${ladderEmoji} <b>${safeMode}</b>`,
      "\u{1F3F0} No recent matches found",
    ].join("\n");
  }

  const civStats = aggregateCivStats(matches);
  const maxNameLen = Math.max(...civStats.map((s) => s.name.length));

  const lines: string[] = [
    `\u{1F464} <b>${safeName}</b> <code>(${profileId})</code>`,
    `${ladderEmoji} <b>${safeMode}</b> Civ Preferences (${matches.length} matches)`,
    "",
  ];

  for (const stat of civStats) {
    lines.push(`\u{1F3F0} ${formatCivLine(stat, maxNameLen)}`);
  }

  return lines.join("\n");
}
