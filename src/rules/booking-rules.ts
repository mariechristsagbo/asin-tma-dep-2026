import { getBeninDayOfWeek, parseBeninDateTime } from "./date-time.js";
import {
  INVALID_DATE_TIME,
  INVALID_NPI,
  SLOT_FULL,
  UPCOMING_APPOINTMENT_EXISTS,
  WEEKEND_CLOSED,
} from "./errors.js";
import type {
  RuleResult,
  SlotAppointment,
  UserAppointment,
} from "./types.js";

const VALID_NPI_PATTERN = /^[0-9]{10}$/;

export function validateNpi(npi: unknown): RuleResult {
  if (typeof npi !== "string" || !VALID_NPI_PATTERN.test(npi)) {
    return INVALID_NPI;
  }

  return { ok: true };
}

export function validateOpeningDay(dateTime: unknown): RuleResult {
  const parsedDateTime = parseBeninDateTime(dateTime);
  if (parsedDateTime === null) {
    return INVALID_DATE_TIME;
  }

  const dayOfWeek = getBeninDayOfWeek(parsedDateTime);
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  if (isWeekend) {
    return WEEKEND_CLOSED;
  }

  return { ok: true };
}

export function validateSlotCapacity(
  appointmentsInSlot: readonly SlotAppointment[],
): RuleResult {
  const activeAppointments = appointmentsInSlot.filter(
    (appointment) => appointment.status !== "annule",
  );
  const occupiedPlaces = activeAppointments.length;

  if (occupiedPlaces >= 3) {
    return SLOT_FULL;
  }

  return { ok: true };
}

export function validateNoUpcomingAppointment(
  userAppointments: readonly UserAppointment[],
  currentTime: Date,
): RuleResult {
  const hasUpcomingAppointment = userAppointments.some(
    (appointment) =>
      appointment.status !== "annule" &&
      appointment.dateTime.getTime() > currentTime.getTime(),
  );

  if (hasUpcomingAppointment) {
    return UPCOMING_APPOINTMENT_EXISTS;
  }

  return { ok: true };
}
