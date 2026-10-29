import {
  APPOINTMENT_CANNOT_BE_CANCELLED,
  CANCELLATION_TOO_LATE,
} from "./errors.js";
import type { Appointment, RuleResult } from "./types.js";

const MINIMUM_CANCELLATION_NOTICE_MS = 24 * 60 * 60 * 1_000;

export function validateCancellation(
  appointment: Appointment,
  currentTime: Date,
): RuleResult {
  if (appointment.status !== "confirme") {
    return APPOINTMENT_CANNOT_BE_CANCELLED;
  }

  const remainingTimeMs =
    appointment.dateTime.getTime() - currentTime.getTime();

  if (remainingTimeMs < MINIMUM_CANCELLATION_NOTICE_MS) {
    return CANCELLATION_TOO_LATE;
  }

  return { ok: true };
}
