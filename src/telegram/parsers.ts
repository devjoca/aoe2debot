import type { Intent } from "../constants";

export const MAX_LAST_COUNT = 5;

export interface ParsedRequest {
  intent: Intent;
  query: string;
  count: number;
}

export function clampLastCount(raw: string | undefined): number {
  if (!raw) {
    return MAX_LAST_COUNT;
  }

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return MAX_LAST_COUNT;
  }

  return Math.min(parsed, MAX_LAST_COUNT);
}

export function parseRequestText(input: string): ParsedRequest | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const tokens = trimmed.split(/\s+/);
  const intent = tokens[0]?.toLowerCase();
  if (intent !== "elo" && intent !== "last" && intent !== "trend") {
    return null;
  }

  if (intent === "elo" || intent === "trend") {
    const query = tokens.slice(1).join(" ").trim();
    if (!query) {
      return null;
    }

    return { intent, query, count: 1 };
  }

  const maybeCount = tokens.at(-1);
  const hasCount = maybeCount !== undefined && /^\d+$/.test(maybeCount);
  const queryTokens = hasCount ? tokens.slice(1, -1) : tokens.slice(1);
  const query = queryTokens.join(" ").trim();
  if (!query) {
    return null;
  }

  return { intent, query, count: clampLastCount(hasCount ? maybeCount : undefined) };
}

export function parseMentionRequest(text: string, botUsername: string | undefined): ParsedRequest | null {
  if (!botUsername) {
    return null;
  }

  const mentionPrefix = `@${botUsername.toLowerCase()}`;
  const trimmed = text.trim();
  if (!trimmed.toLowerCase().startsWith(mentionPrefix)) {
    return null;
  }

  const rest = trimmed.slice(mentionPrefix.length).trim();
  return parseRequestText(rest);
}
