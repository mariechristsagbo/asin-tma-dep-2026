export type HttpStatus = 400 | 409;

export type Service = "PASSEPORT" | "CNI" | "PERMIS";

export type RuleSuccess = Readonly<{
  ok: true;
}>;

export type RuleFailure = Readonly<{
  ok: false;
  httpStatus: HttpStatus;
  message: string;
}>;

export type RuleResult = RuleSuccess | RuleFailure;

export type AppointmentStatus =
  | "confirme"
  | "honore"
  | "absent"
  | "annule";

export type AttendanceStatus = "honore" | "absent";

export type Appointment = Readonly<{
  status: AppointmentStatus;
  dateTime: Date;
}>;

export type SlotAppointment = Pick<Appointment, "status">;

export type UserAppointment = Appointment;

export type AppointmentPage<T extends Appointment> = Readonly<{
  page: number;
  perPage: 10;
  total: number;
  appointments: readonly T[];
}>;

export type BookingRequest = Readonly<{
  npi: unknown;
  service: unknown;
  dateTime: unknown;
}>;

export type BookingContext = Readonly<{
  currentTime: Date;
  userAppointments: readonly UserAppointment[];
  appointmentsInSlot: readonly SlotAppointment[];
}>;
