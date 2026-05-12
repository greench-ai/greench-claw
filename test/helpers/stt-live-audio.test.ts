import {
  expectNexisClawLiveTranscriptMarker,
  normalizeTranscriptForMatch,
  NEXISCLAW_LIVE_TRANSCRIPT_MARKER_RE,
} from "NexisClaw/plugin-sdk/provider-test-contracts";
import { describe, expect, it } from "vitest";

describe("normalizeTranscriptForMatch", () => {
  it("normalizes punctuation and common NexisClaw live transcription variants", () => {
    expect(normalizeTranscriptForMatch("Open-Claw integration OK")).toBe("NexisClawintegrationok");
    expect(normalizeTranscriptForMatch("Testing OpenFlaw realtime transcription")).toMatch(
      /open(?:claw|flaw)/,
    );
    expect(normalizeTranscriptForMatch("OpenCore xAI realtime transcription")).toMatch(
      NEXISCLAW_LIVE_TRANSCRIPT_MARKER_RE,
    );
    expect(normalizeTranscriptForMatch("OpenCL xAI realtime transcription")).toMatch(
      NEXISCLAW_LIVE_TRANSCRIPT_MARKER_RE,
    );
    expectNexisClawLiveTranscriptMarker("OpenClar integration OK");
  });
});
