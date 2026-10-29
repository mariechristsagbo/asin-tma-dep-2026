import { describe, expect, it } from "vitest";

import {
  sortAndPaginateAppointments,
  validateCancellation,
  validateFutureDate,
  validateNoUpcomingAppointment,
  validateNpi,
  validateOpeningDay,
  validateService,
  validateSlotCapacity,
  validateStatusChange,
  validateTimeSlot,
} from "../src/index.js";

describe("booking boundaries", () => {
  it.each(["123456789", "12345678901", 614253647, null])(
    "rejects the invalid NPI %s",
    (npi) => {
      expect(validateNpi(npi).ok).toBe(false);
    },
  );

  it("accepts a ten-digit NPI with a leading zero", () => {
    expect(validateNpi("0614253647")).toEqual({ ok: true });
  });

  it.each(["PASSEPORT", "CNI", "PERMIS"])(
    "accepts the known service %s",
    (service) => {
      expect(validateService(service)).toEqual({ ok: true });
    },
  );

  it("rejects an impossible calendar date", () => {
    expect(validateFutureDate("2026-02-30T10:00", new Date(0))).toEqual({
      ok: false,
      httpStatus: 400,
      message: "Date et heure invalides (format attendu : AAAA-MM-JJTHH:MM).",
    });
  });

  it("accepts a weekday", () => {
    expect(validateOpeningDay("2026-11-23T09:00")).toEqual({ ok: true });
  });

  it.each(["2026-11-23T08:00", "2026-11-23T15:30"])(
    "accepts the boundary time slot %s",
    (dateTime) => {
      expect(validateTimeSlot(dateTime)).toEqual({ ok: true });
    },
  );

  it("does not count a cancelled appointment toward slot capacity", () => {
    expect(
      validateSlotCapacity([
        { status: "confirme" },
        { status: "confirme" },
        { status: "annule" },
      ]),
    ).toEqual({ ok: true });
  });

  it("ignores past and cancelled appointments for the upcoming limit", () => {
    const currentTime = new Date("2026-11-20T18:00:00+01:00");

    expect(
      validateNoUpcomingAppointment(
        [
          {
            dateTime: new Date("2026-11-19T10:00:00+01:00"),
            status: "honore",
          },
          {
            dateTime: new Date("2026-11-23T10:00:00+01:00"),
            status: "annule",
          },
        ],
        currentTime,
      ),
    ).toEqual({ ok: true });
  });
});

describe("cancellation boundaries", () => {
  it("allows cancellation exactly 24 hours in advance", () => {
    expect(
      validateCancellation(
        {
          dateTime: new Date("2026-11-19T18:00:00+01:00"),
          status: "confirme",
        },
        new Date("2026-11-18T18:00:00+01:00"),
      ),
    ).toEqual({ ok: true });
  });

  it("rejects cancellation less than 24 hours in advance", () => {
    expect(
      validateCancellation(
        {
          dateTime: new Date("2026-11-19T17:59:00+01:00"),
          status: "confirme",
        },
        new Date("2026-11-18T18:00:00+01:00"),
      ),
    ).toMatchObject({
      ok: false,
      httpStatus: 409,
    });
  });

  it("rejects cancellation of a closed appointment", () => {
    expect(
      validateCancellation(
        {
          dateTime: new Date("2026-11-25T10:00:00+01:00"),
          status: "honore",
        },
        new Date("2026-11-20T18:00:00+01:00"),
      ),
    ).toEqual({
      ok: false,
      httpStatus: 409,
      message: "Ce rendez-vous ne peut plus être annulé.",
    });
  });
});

describe("status boundaries", () => {
  it("rejects an unknown requested status", () => {
    expect(validateStatusChange("confirme", "annule")).toEqual({
      ok: false,
      httpStatus: 400,
      message: "Statut invalide : honore ou absent.",
    });
  });

  it.each(["honore", "absent"] as const)(
    "allows the transition from confirme to %s",
    (status) => {
      expect(validateStatusChange("confirme", status)).toEqual({ ok: true });
    },
  );
});

describe("list boundaries", () => {
  it("returns the second page after sorting the complete list", () => {
    const appointments = Array.from({ length: 12 }, (_, index) => ({
      id: index + 1,
      dateTime: new Date(Date.UTC(2026, 0, index + 1, 8)),
      status: "honore" as const,
    }));

    const result = sortAndPaginateAppointments(
      appointments,
      new Date(Date.UTC(2026, 11, 31)),
      2,
    );

    expect(result.appointments.map(({ id }) => id)).toEqual([2, 1]);
    expect(result.total).toBe(12);
    expect(appointments.map(({ id }) => id)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
  });
});
