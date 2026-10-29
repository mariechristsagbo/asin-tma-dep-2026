import { describe, expect, it } from "vitest";

import { sortAndPaginateAppointments } from "../../src/index.js";

function appointment(id: number, localDateTime: string) {
  return {
    id,
    dateTime: new Date(`${localDateTime}:00+01:00`),
    status: "honore" as const,
  };
}

describe("TMA-106 - upcoming appointment missing from the first page", () => {
  it("sorts the complete list before returning the first page", () => {
    const currentTime = new Date("2026-11-20T18:00:00+01:00");
    const appointments = [
      appointment(1, "2026-01-05T08:30"),
      appointment(2, "2026-02-12T10:00"),
      appointment(3, "2026-03-03T14:30"),
      appointment(4, "2026-04-21T09:00"),
      appointment(5, "2026-05-08T11:30"),
      appointment(6, "2026-05-19T15:00"),
      appointment(7, "2026-06-02T08:00"),
      appointment(8, "2026-06-16T13:30"),
      appointment(9, "2026-07-07T10:30"),
      appointment(10, "2026-07-28T09:30"),
      appointment(11, "2026-08-11T14:00"),
      appointment(259, "2026-09-25T11:00"),
      appointment(826, "2026-12-02T08:30"),
    ];

    const result = sortAndPaginateAppointments(
      appointments,
      currentTime,
      1,
    );

    expect(result.appointments.map(({ id }) => id)).toEqual([
      826, 259, 11, 10, 9, 8, 7, 6, 5, 4,
    ]);
    expect(result).toMatchObject({
      page: 1,
      perPage: 10,
      total: 13,
    });
  });
});
