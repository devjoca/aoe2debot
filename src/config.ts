import type { UserFromGetMe } from "grammy/types";

export function parseBotInfo(botInfo?: string): UserFromGetMe | undefined {
  if (!botInfo || botInfo.trim() === "") {
    return undefined;
  }

  try {
    const parsed = JSON.parse(botInfo);
    if (!parsed || typeof parsed !== "object") {
      console.error("BOT_INFO is not a valid object, ignoring");
      return undefined;
    }
    // Handle full getMe response: {"ok":true,"result":{...}}
    const info = parsed.result ?? parsed;
    if (!info.username) {
      console.error("BOT_INFO is missing 'username' field:", JSON.stringify(info));
      return undefined;
    }
    return info as UserFromGetMe;
  } catch (error) {
    console.error("Failed to parse BOT_INFO:", error);
    return undefined;
  }
}
