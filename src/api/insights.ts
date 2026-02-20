const INSIGHTS_BASE_URL = "https://www.aoe2insights.com";

export interface EloDatapoint {
  x: number;
  y: number;
}

async function getInsights<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${INSIGHTS_BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getEloHistory(profileId: number, leaderboardId: number): Promise<EloDatapoint[] | null> {
  return getInsights<EloDatapoint[]>(`/user/${profileId}/elo-history/${leaderboardId}/`);
}
