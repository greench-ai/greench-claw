import { describe, expect, it } from "vitest";
import { resolveIrcInboundTarget } from "./monitor.js";

describe("irc monitor inbound target", () => {
  it("keeps channel target for group messages", () => {
    expect(
      resolveIrcInboundTarget({
        target: "#NexisClaw",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: true,
      target: "#NexisClaw",
      rawTarget: "#NexisClaw",
    });
  });

  it("maps DM target to sender nick and preserves raw target", () => {
    expect(
      resolveIrcInboundTarget({
        target: "NexisClaw-bot",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: false,
      target: "alice",
      rawTarget: "NexisClaw-bot",
    });
  });

  it("falls back to raw target when sender nick is empty", () => {
    expect(
      resolveIrcInboundTarget({
        target: "NexisClaw-bot",
        senderNick: " ",
      }),
    ).toEqual({
      isGroup: false,
      target: "NexisClaw-bot",
      rawTarget: "NexisClaw-bot",
    });
  });
});
