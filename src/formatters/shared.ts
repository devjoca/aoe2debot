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

export function formatDate(raw: string): string {
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}:\d{2})/);
  if (!match) {
    return raw;
  }

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const day = Number.parseInt(match[3], 10);
  const month = months[Number.parseInt(match[2], 10) - 1];
  const time = match[4];
  return `${day} ${month} ${time}`;
}
