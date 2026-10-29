import { describe, expect, it } from "vitest";

import { validateNoUpcomingAppointment } from "../../src/index.js";

describe("TMA-107 - second upcoming appointment for another service", () => {
  it("keeps rejecting the request across all services", () => {
    const currentTime = new Date("2026-11-20T18:00:00+01:00");
    const userAppointments = [
      {
        dateTime: new Date("2026-11-26T10:00:00+01:00"),
        status: "confirme",
      },
    ] as const;

    const result = validateNoUpcomingAppointment(
      userAppointments,
      currentTime,
    );

    expect(result).toEqual({
      ok: false,
      httpStatus: 409,
      message: "Vous avez déjà un rendez-vous à venir.",
    });
  });
});
