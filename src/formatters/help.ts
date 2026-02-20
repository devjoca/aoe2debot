export function buildHelpText(botUsername: string): string {
  return [
    "Aoede2Bot commands:",
    "/elo <player> - pick Team Random or 1v1, then show ELO",
    "/last <player> [count] - pick Team Random or 1v1, then show recent matches",
    "",
    "Group mention examples:",
    `@${botUsername} elo yayo`,
    `@${botUsername} last yayo`,
    `@${botUsername} last yayo 5`,
    "",
    "Notes:",
    "- If player name is ambiguous, you pick the correct one",
    "- For /last, count defaults to 5 (max 5)",
  ].join("\n");
}
