# aoede2bot

Telegram bot for Age of Empires II ranked stats.

It supports:
- `/elo <player>`: pick Team Random or 1v1, then show ELO + record
- `/last <player> [count]`: pick Team Random or 1v1, then show recent matches

## Stack

- TypeScript
- [grammY](https://grammy.dev/)
- Cloudflare Workers (webhook mode)

## Requirements

- Node.js 20+
- npm
- Cloudflare account + Wrangler
- Telegram bot token

## Install

```bash
npm install
```

## Environment

Local development uses `.env`:

- `BOT_TOKEN`: Telegram bot token

Production (Worker) uses secrets:

- `BOT_TOKEN`: Telegram bot token
- `BOT_INFO`: raw JSON of Telegram `getMe` result object

Example `.env`:

```env
BOT_TOKEN=123456:abcDEF...
```

## Run locally (long polling)

```bash
npm run dev
```

This starts the bot using `src/dev.ts`.

## Register Telegram command menus

```bash
npm run setup:commands
```

This updates Telegram's command list scopes so the `/` menu shows:

- Private chats: `/start`, `/help`, `/elo`, `/last`
- Group chats: `/elo`, `/last`

## Typecheck and tests

```bash
npx tsc --noEmit
npm run test:run
```

## Deploy to Cloudflare Workers

1) Set Worker secrets:

```bash
npx wrangler secret put BOT_TOKEN
npx wrangler secret put BOT_INFO
```

2) Deploy:

```bash
npm run deploy
```

3) Set Telegram webhook to your Worker URL:

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://<your-worker-url>"
```

4) Verify webhook:

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

## Getting `BOT_INFO`

Fetch bot metadata:

```bash
curl "https://api.telegram.org/bot<BOT_TOKEN>/getMe"
```

Take the `result` JSON object from that response and store it as `BOT_INFO`.

## Command behavior

- If player name is ambiguous, bot asks you to pick a player.
- Then bot asks you to pick mode: `Team Random` or `1v1`.
- `/last` count defaults to `5` and max is `5`.

## Project layout

- `src/bot.ts`: bot wiring (commands, callbacks, mention handling)
- `src/handlers/`: command and callback handlers
- `src/age2.ts`: Age2 API client
- `src/parsers.ts`: text parsing and count clamping
- `src/formatters.ts`: response/help formatting
- `src/index.ts`: Cloudflare Worker entry point
- `src/dev.ts`: local long-polling entry point
