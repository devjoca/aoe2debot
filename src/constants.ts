export type Intent = "elo" | "last";
export type Mode = "team" | "solo";

export const TEAM_MATCH_TYPE = 4;
export const SOLO_MATCH_TYPE = 3;

export function modeLabel(mode: Mode): string {
  return mode === "solo" ? "1v1" : "Team Random";
}

export function matchTypeForMode(mode: Mode): 3 | 4 {
  return mode === "solo" ? SOLO_MATCH_TYPE : TEAM_MATCH_TYPE;
}
