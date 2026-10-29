export {
  validateNpi,
  validateNoUpcomingAppointment,
  validateOpeningDay,
  validateSlotCapacity,
} from "./rules/booking-rules.js";
export { validateCancellation } from "./rules/cancellation-rules.js";
export { validateStatusChange } from "./rules/status-rules.js";
export type {
  Appointment,
  AppointmentStatus,
  AttendanceStatus,
  HttpStatus,
  RuleFailure,
  RuleResult,
  RuleSuccess,
  SlotAppointment,
  UserAppointment,
} from "./rules/types.js";
