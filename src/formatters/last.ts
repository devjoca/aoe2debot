import type { MatchDetailResponse } from "../api/types";
import { escapeHtml, formatDate, modeEmoji, resultEmoji } from "./shared";

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
