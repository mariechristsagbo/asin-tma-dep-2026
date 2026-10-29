import { describe, expect, it } from "vitest";

import { validateCancellation } from "../../src/index.js";

describe("TMA-104 - cancellation requested 40 hours in advance", () => {
  it("allows the cancellation", () => {
    const currentTime = new Date("2026-11-17T18:00:00+01:00");
    const appointment = {
      dateTime: new Date("2026-11-19T10:00:00+01:00"),
      status: "confirme",
    } as const;

    const result = validateCancellation(appointment, currentTime);

    expect(result).toEqual({ ok: true });
  });
});
