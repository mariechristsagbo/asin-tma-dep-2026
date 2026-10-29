import { describe, expect, it } from "vitest";

import { validateOpeningDay } from "../../src/index.js";

describe("TMA-101 - appointment scheduled on a Saturday", () => {
  it("rejects the appointment with the expected functional error", () => {
    const result = validateOpeningDay("2026-11-14T10:00");

    expect(result).toEqual({
      ok: false,
      httpStatus: 409,
      message: "Le centre est fermé le week-end.",
    });
  });
});
