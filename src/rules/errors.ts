import type { RuleFailure } from "./types.js";

export const INVALID_NPI = {
  ok: false,
  httpStatus: 400,
  message: "Le NPI doit comporter exactement 10 chiffres.",
} as const satisfies RuleFailure;

export const UNKNOWN_SERVICE = {
  ok: false,
  httpStatus: 400,
  message: "Service inconnu : choisissez PASSEPORT, CNI ou PERMIS.",
} as const satisfies RuleFailure;

export const INVALID_DATE_TIME = {
  ok: false,
  httpStatus: 400,
  message: "Date et heure invalides (format attendu : AAAA-MM-JJTHH:MM).",
} as const satisfies RuleFailure;

export const APPOINTMENT_IN_PAST = {
  ok: false,
  httpStatus: 409,
  message: "Impossible de prendre un rendez-vous dans le passé.",
} as const satisfies RuleFailure;

export const WEEKEND_CLOSED = {
  ok: false,
  httpStatus: 409,
  message: "Le centre est fermé le week-end.",
} as const satisfies RuleFailure;

export const INVALID_TIME_SLOT = {
  ok: false,
  httpStatus: 409,
  message: "Créneau invalide : de 08:00 à 15:30, toutes les 30 minutes.",
} as const satisfies RuleFailure;

export const SLOT_FULL = {
  ok: false,
  httpStatus: 409,
  message: "Ce créneau est complet.",
} as const satisfies RuleFailure;

export const UPCOMING_APPOINTMENT_EXISTS = {
  ok: false,
  httpStatus: 409,
  message: "Vous avez déjà un rendez-vous à venir.",
} as const satisfies RuleFailure;

export const APPOINTMENT_CANNOT_BE_CANCELLED = {
  ok: false,
  httpStatus: 409,
  message: "Ce rendez-vous ne peut plus être annulé.",
} as const satisfies RuleFailure;

export const CANCELLATION_TOO_LATE = {
  ok: false,
  httpStatus: 409,
  message: "Annulation impossible moins de 24 h avant le rendez-vous.",
} as const satisfies RuleFailure;

export const INVALID_ATTENDANCE_STATUS = {
  ok: false,
  httpStatus: 400,
  message: "Statut invalide : honore ou absent.",
} as const satisfies RuleFailure;

export const APPOINTMENT_ALREADY_CLOSED = {
  ok: false,
  httpStatus: 409,
  message: "Ce rendez-vous est déjà clôturé.",
} as const satisfies RuleFailure;
