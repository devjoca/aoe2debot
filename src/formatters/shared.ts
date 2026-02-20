export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

export function formatWinRate(totalMatches: number, totalWins: number): string {
  if (totalMatches <= 0) {
    return "0.0";
  }

  return ((totalWins / totalMatches) * 100).toFixed(1);
}

export function modeEmoji(modeLabelValue: string): string {
  return modeLabelValue === "1v1" ? "⚔️" : "🏆";
}

export function resultEmoji(result: string): string {
  if (result.toLowerCase() === "win") {
    return "✅";
  }

  if (result.toLowerCase() === "loss") {
    return "❌";
  }

  return "▫️";
}

export function timeAgo(raw: string): string {
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})/);
  if (!match) {
    return raw;
  }

  const utc = Date.UTC(
    Number.parseInt(match[1], 10),
    Number.parseInt(match[2], 10) - 1,
    Number.parseInt(match[3], 10),
    Number.parseInt(match[4], 10),
    Number.parseInt(match[5], 10),
  );

  const diffSec = Math.max(0, Math.floor((Date.now() - utc) / 1000));

  if (diffSec < 60) return "just now";
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
