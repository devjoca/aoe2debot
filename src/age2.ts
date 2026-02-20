const AGE2_BASE_URL = "https://api.ageofempires.com";

type MatchType = 3 | 4;

interface LeaderboardItem {
  rlUserId: number;
  userName: string;
  elo: number | null;
}

interface LeaderboardResponse {
  items?: LeaderboardItem[];
}

export interface CareerStats {
  unitsKilled?: number;
  unitsLost?: number;
  buildingsRaised?: number;
  buildingsLost?: number;
  wondersBuilt?: number;
  castlesBuilt?: number;
  trebsBuilt?: number;
  farmsBuilt?: number;
  highScoreMilitary?: number;
  highScoreEconomy?: number;
  highScoreTechnology?: number;
}

interface FullStatsResponse {
  user?: {
    profileId?: number;
    userName?: string;
    elo?: number | null;
    playerStanding?: number;
  };
  mpStatList?: {
    totalMatches?: number;
    totalWins?: number;
    currentWinStreak?: number;
  };
  careerStats?: CareerStats;
}

interface MatchListResponse {
  matchList?: Array<{
    matchId?: string;
    dateTime?: string;
    mapType?: string;
    civilization?: string;
    winLoss?: string;
  }>;
}

interface MatchDetailResponse {
  matchSummary?: {
    dateTime?: string;
    matchLength?: number;
    mapType?: string;
  };
  playerList?: Array<{
    userId?: string;
    userName?: string;
    team?: number;
    civName?: string;
    winLoss?: string;
  }>;
}

async function postAge2<T>(path: string, payload: unknown): Promise<T | null> {
  const response = await fetch(`${AGE2_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://www.ageofempires.com",
      Referer: "https://www.ageofempires.com/",
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Age2 API error ${response.status} for ${path}`);
  }

  return (await response.json()) as T;
}

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

export async function getMatchList(profileId: number, matchType: MatchType, count: number): Promise<MatchListResponse> {
  const data = await postAge2<MatchListResponse>("/api/GameStats/AgeII/GetMatchList", {
    gamertag: "unknown user",
    playerNumber: 0,
    game: "age2",
    profileId,
    sortColumn: "dateTime",
    sortDirection: "DESC",
    page: 1,
    count,
    matchType: String(matchType),
  });

  return data ?? { matchList: [] };
}

export async function getMatchDetail(profileId: number, matchId: string): Promise<MatchDetailResponse> {
  const data = await postAge2<MatchDetailResponse>("/api/GameStats/AgeII/GetMatchDetail", {
    profileId,
    matchId,
  });

  return data ?? {};
}

export type { LeaderboardItem, MatchDetailResponse };
