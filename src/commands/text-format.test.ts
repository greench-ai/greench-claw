import { describe, expect, it } from "vitest";
import { shortenText } from "./text-format.js";

describe("shortenText", () => {
  it("returns original text when it fits", () => {
    expect(shortenText("NexisClaw", 16)).toBe("NexisClaw");
  });

  it("truncates and appends ellipsis when over limit", () => {
    expect(shortenText("NexisClaw-status-output", 10)).toBe("NexisClaw-…");
  });

  it("counts multi-byte characters correctly", () => {
    expect(shortenText("hello🙂world", 7)).toBe("hello🙂…");
  });
});
