import { postAge2 } from "./client";
import type { MatchDetailResponse, MatchListResponse } from "./types";

type MatchType = 3 | 4;

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
