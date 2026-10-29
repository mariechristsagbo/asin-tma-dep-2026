import { describe, expect, it } from "vitest";

import { validateNpi } from "../../src/index.js";

describe("TMA-103 - invalid NPI", () => {
  it("returns the expected functional error when the NPI contains a letter", () => {
    const result = validateNpi("06142A3647");

    expect(result).toEqual({
      ok: false,
      httpStatus: 400,
      message: "Le NPI doit comporter exactement 10 chiffres.",
    });
  });
});
