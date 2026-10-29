export type HttpStatus = 400 | 409;

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

export type Appointment = Readonly<{
  status: AppointmentStatus;
  dateTime: Date;
}>;

export type SlotAppointment = Pick<Appointment, "status">;

export type UserAppointment = Appointment;
