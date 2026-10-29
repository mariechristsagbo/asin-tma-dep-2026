import type { RuleFailure } from "./types.js";

export const INVALID_NPI = {
  ok: false,
  httpStatus: 400,
  message: "Le NPI doit comporter exactement 10 chiffres.",
} as const satisfies RuleFailure;

export const INVALID_DATE_TIME = {
  ok: false,
  httpStatus: 400,
  message: "Date et heure invalides (format attendu : AAAA-MM-JJTHH:MM).",
} as const satisfies RuleFailure;

export const WEEKEND_CLOSED = {
  ok: false,
  httpStatus: 409,
  message: "Le centre est fermé le week-end.",
} as const satisfies RuleFailure;

export const SLOT_FULL = {
  ok: false,
  httpStatus: 409,
  message: "Ce créneau est complet.",
} as const satisfies RuleFailure;
