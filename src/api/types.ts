export interface LeaderboardItem {
  rlUserId: number;
  userName: string;
  elo: number | null;
}

export interface LeaderboardResponse {
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

export interface FullStatsResponse {
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

export interface MatchListResponse {
  matchList?: Array<{
    matchId?: string;
    dateTime?: string;
    mapType?: string;
    civilization?: string;
    winLoss?: string;
  }>;
}

export interface MatchDetailResponse {
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
