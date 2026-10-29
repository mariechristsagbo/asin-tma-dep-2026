import type { RuleFailure } from "./types.js";

export const INVALID_NPI = {
  ok: false,
  httpStatus: 400,
  message: "Le NPI doit comporter exactement 10 chiffres.",
} as const satisfies RuleFailure;
