const BENIN_UTC_OFFSET_MS = 60 * 60 * 1_000;

const LOCAL_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

export function parseBeninDateTime(value: unknown): Date | null {
  if (typeof value !== "string") {
    return null;
  }

  const match = LOCAL_DATE_TIME_PATTERN.exec(value);
  if (match === null) {
    return null;
  }

  const [, yearText, monthText, dayText, hourText, minuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);

  // Build the local components in UTC to detect normalized invalid dates.
  const localComponentsAsUtc = new Date(
    Date.UTC(year, month - 1, day, hour, minute),
  );
  
  const hasValidComponents =
    localComponentsAsUtc.getUTCFullYear() === year &&
    localComponentsAsUtc.getUTCMonth() === month - 1 &&
    localComponentsAsUtc.getUTCDate() === day &&
    localComponentsAsUtc.getUTCHours() === hour &&
    localComponentsAsUtc.getUTCMinutes() === minute;

  if (!hasValidComponents) {
    return null;
  }

  // Convert the Benin local time (UTC+1) to its corresponding UTC instant.
  return new Date(localComponentsAsUtc.getTime() - BENIN_UTC_OFFSET_MS);
}

export function getBeninDayOfWeek(dateTime: Date): number {
  return new Date(dateTime.getTime() + BENIN_UTC_OFFSET_MS).getUTCDay();
}
