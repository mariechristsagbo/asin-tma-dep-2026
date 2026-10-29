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

export type SlotAppointment = Readonly<{
  status: AppointmentStatus;
}>;

export type UserAppointment = SlotAppointment &
  Readonly<{
    dateTime: Date;
  }>;
