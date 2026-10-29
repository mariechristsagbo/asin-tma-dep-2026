import { describe, expect, it } from "vitest";

import { validateSlotCapacity } from "../../src/index.js";

describe("TMA-102 - fourth appointment in the same slot", () => {
  it("rejects a booking when three non-cancelled appointments already exist", () => {
    const result = validateSlotCapacity([
      { status: "confirme" },
      { status: "confirme" },
      { status: "confirme" },
    ]);

    expect(result).toEqual({
      ok: false,
      httpStatus: 409,
      message: "Ce créneau est complet.",
    });
  });
});
