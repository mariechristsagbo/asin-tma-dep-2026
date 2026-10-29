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
