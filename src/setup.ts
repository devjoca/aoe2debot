import "dotenv/config";
import { Bot } from "grammy";
import { setCommands } from "./commands";

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Set BOT_TOKEN env var: BOT_TOKEN=xxx npx tsx src/setup.ts");
  process.exit(1);
}

const bot = new Bot(token);

await setCommands(bot);

console.log("Telegram command menus updated for private and group chats.");
