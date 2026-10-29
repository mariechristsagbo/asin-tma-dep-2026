import { describe, expect, it } from "vitest";

import {
  validateBooking,
  validateFutureDate,
  validateService,
  validateTimeSlot,
} from "../../src/index.js";

describe("booking rules", () => {
  it("accepts a booking that satisfies every rule", () => {
    const result = validateBooking(
      {
        npi: "0614253647",
        service: "PASSEPORT",
        dateTime: "2026-11-23T09:00",
      },
      {
        currentTime: new Date("2026-11-20T18:00:00+01:00"),
        userAppointments: [],
        appointmentsInSlot: [],
      },
    );

    expect(result).toEqual({ ok: true });
  });

  it("rejects an unknown service", () => {
    const result = validateService("VISA");

    expect(result).toEqual({
      ok: false,
      httpStatus: 400,
      message: "Service inconnu : choisissez PASSEPORT, CNI ou PERMIS.",
    });
  });

  it("rejects an appointment in the past", () => {
    const currentTime = new Date("2026-11-20T18:00:00+01:00");

    const result = validateFutureDate(
      "2026-11-20T17:30",
      currentTime,
    );

    expect(result).toEqual({
      ok: false,
      httpStatus: 409,
      message: "Impossible de prendre un rendez-vous dans le passé.",
    });
  });

  it.each(["2026-11-23T07:30", "2026-11-23T09:15", "2026-11-23T16:00"])(
    "rejects the invalid time slot %s",
    (dateTime) => {
      const result = validateTimeSlot(dateTime);

      expect(result).toEqual({
        ok: false,
        httpStatus: 409,
        message:
          "Créneau invalide : de 08:00 à 15:30, toutes les 30 minutes.",
      });
    },
  );
});
