import "dotenv/config";
import { createBot } from "./bot";
import { setCommands } from "./commands";

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("Set BOT_TOKEN env var: BOT_TOKEN=xxx npx tsx src/dev.ts");
  process.exit(1);
}

const bot = createBot(token);

bot.start({
  onStart: async (botInfo) => {
    await setCommands(bot);
    console.log(`🤖 Bot @${botInfo.username} running with long polling...`);
  },
});
