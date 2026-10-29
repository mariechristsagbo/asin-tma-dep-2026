import type { Appointment, AppointmentPage } from "./types.js";

const APPOINTMENTS_PER_PAGE = 10;

export function sortAndPaginateAppointments<T extends Appointment>(
  appointments: readonly T[],
  currentTime: Date,
  page: number,
): AppointmentPage<T> {
  const currentTimestamp = currentTime.getTime();
  const sortedAppointments = [...appointments].sort((first, second) => {
    const firstTimestamp = first.dateTime.getTime();
    const secondTimestamp = second.dateTime.getTime();
    const firstIsUpcoming = firstTimestamp > currentTimestamp;
    const secondIsUpcoming = secondTimestamp > currentTimestamp;

    if (firstIsUpcoming && secondIsUpcoming) {
      return firstTimestamp - secondTimestamp;
    }

    if (firstIsUpcoming) {
      return -1;
    }

    if (secondIsUpcoming) {
      return 1;
    }

    return secondTimestamp - firstTimestamp;
  });

  const firstIndex = (page - 1) * APPOINTMENTS_PER_PAGE;
  const pageAppointments = sortedAppointments.slice(
    firstIndex,
    firstIndex + APPOINTMENTS_PER_PAGE,
  );

  return {
    page,
    perPage: APPOINTMENTS_PER_PAGE,
    total: appointments.length,
    appointments: pageAppointments,
  };
}
