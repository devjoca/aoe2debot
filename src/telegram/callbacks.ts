import type { Intent, Mode } from "../constants";

function encodeIntentCode(intent: Intent): string {
  if (intent === "elo") return "e";
  if (intent === "last") return "l";
  return "t";
}

export function encodePickPlayer(intent: Intent, count: number, profileId: number): string {
  return `a2|p|${encodeIntentCode(intent)}|${count}|${profileId}`;
}

export function encodePickMode(intent: Intent, count: number, profileId: number, mode: Mode): string {
  const modeCode = mode === "team" ? "t" : "s";
  return `a2|m|${encodeIntentCode(intent)}|${count}|${profileId}|${modeCode}`;
}

export function decodeIntent(code: string): Intent | null {
  if (code === "e") return "elo";
  if (code === "l") return "last";
  if (code === "t") return "trend";
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
