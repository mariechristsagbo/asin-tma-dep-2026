import { describe, expect, it } from "vitest";

import { validateService } from "../../src/index.js";

describe("booking rules", () => {
  it("rejects an unknown service", () => {
    const result = validateService("VISA");

    expect(result).toEqual({
      ok: false,
      httpStatus: 400,
      message: "Service inconnu : choisissez PASSEPORT, CNI ou PERMIS.",
    });
  });
});
