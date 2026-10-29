import { describe, expect, it } from "vitest";

import { validateStatusChange } from "../../src/index.js";

describe("TMA-105 - status change after cancellation", () => {
  it("rejects a change from annule to honore", () => {
    const result = validateStatusChange("annule", "honore");

    expect(result).toEqual({
      ok: false,
      httpStatus: 409,
      message: "Ce rendez-vous est déjà clôturé.",
    });
  });
});
