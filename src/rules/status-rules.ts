import {
  APPOINTMENT_ALREADY_CLOSED,
  INVALID_ATTENDANCE_STATUS,
} from "./errors.js";
import type {
  AppointmentStatus,
  AttendanceStatus,
  RuleResult,
} from "./types.js";

function isAttendanceStatus(value: unknown): value is AttendanceStatus {
  return value === "honore" || value === "absent";
}

export function validateStatusChange(
  currentStatus: AppointmentStatus,
  requestedStatus: unknown,
): RuleResult {
  if (!isAttendanceStatus(requestedStatus)) {
    return INVALID_ATTENDANCE_STATUS;
  }

  if (currentStatus !== "confirme") {
    return APPOINTMENT_ALREADY_CLOSED;
  }

  return { ok: true };
}
