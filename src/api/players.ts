import { postAge2 } from "./client";
import type { FullStatsResponse, LeaderboardItem, LeaderboardResponse } from "./types";

type MatchType = 3 | 4;

export async function searchPlayers(query: string): Promise<LeaderboardItem[]> {
  const [soloData, teamData] = await Promise.all([
    postAge2<LeaderboardResponse>("/api/v2/ageii/Leaderboard", {
      region: 7,
      matchType: 3,
      consoleMatchType: 15,
      searchPlayer: query,
      page: 1,
      count: 10,
      sortColumn: "rank",
      sortDirection: "ASC",
    }),
    postAge2<LeaderboardResponse>("/api/v2/ageii/Leaderboard", {
      region: 7,
      matchType: 4,
      consoleMatchType: 15,
      searchPlayer: query,
      page: 1,
      count: 10,
      sortColumn: "rank",
      sortDirection: "ASC",
    }),
  ]);

  const seen = new Set<number>();
  const merged: LeaderboardItem[] = [];
  for (const item of [...(teamData?.items ?? []), ...(soloData?.items ?? [])]) {
    if (!seen.has(item.rlUserId)) {
      seen.add(item.rlUserId);
      merged.push(item);
    }
  }
  return merged;
}

export async function getFullStats(profileId: number, matchType: MatchType): Promise<FullStatsResponse> {
  const data = await postAge2<FullStatsResponse>("/api/GameStats/AgeII/GetFullStats", {
    profileId: String(profileId),
    gamertag: "unknown user",
    playerNumber: 0,
    gameId: 0,
    matchType: String(matchType),
  });

  return data ?? {};
}
