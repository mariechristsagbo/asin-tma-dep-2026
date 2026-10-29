import { INVALID_NPI } from "./errors.js";
import type { RuleResult } from "./types.js";

const VALID_NPI_PATTERN = /^[0-9]{10}$/;

export function validateNpi(npi: unknown): RuleResult {
  if (typeof npi !== "string" || !VALID_NPI_PATTERN.test(npi)) {
    return INVALID_NPI;
  }

  return { ok: true };
}
