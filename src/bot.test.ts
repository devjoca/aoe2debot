import { describe, it, expect } from "vitest";
import { createBot } from "./bot";

describe("createBot", () => {
  it("creates a bot instance", () => {
    const bot = createBot("fake-token");
    expect(bot).toBeDefined();
  });
});
