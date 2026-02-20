import type { Intent, Mode } from "../constants";

export function encodePickPlayer(intent: Intent, count: number, profileId: number): string {
  const intentCode = intent === "elo" ? "e" : "l";
  return `a2|p|${intentCode}|${count}|${profileId}`;
}

export function encodePickMode(intent: Intent, count: number, profileId: number, mode: Mode): string {
  const intentCode = intent === "elo" ? "e" : "l";
  const modeCode = mode === "team" ? "t" : "s";
  return `a2|m|${intentCode}|${count}|${profileId}|${modeCode}`;
}

export function decodeIntent(code: string): Intent | null {
  if (code === "e") {
    return "elo";
  }

  if (code === "l") {
    return "last";
  }

  return null;
}

export function decodeMode(code: string): Mode | null {
  if (code === "t") {
    return "team";
  }

  if (code === "s") {
    return "solo";
  }

  return null;
}
