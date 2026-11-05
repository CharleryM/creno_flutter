export function eurosToCents(
  value: string,
): number | null {
  const normalized = value
    .trim()
    .replace(",", ".");

  const amount = Number(normalized);

  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    return null;
  }

  return Math.round(amount * 100);
}

export function buildCourseDate(
  dateValue: string,
  timeValue: string,
): Date | null {
  const datePattern =
    /^\d{4}-\d{2}-\d{2}$/;

  const timePattern =
    /^\d{2}:\d{2}$/;

  if (
    !datePattern.test(dateValue) ||
    !timePattern.test(timeValue)
  ) {
    return null;
  }

  const date = new Date(
    `${dateValue}T${timeValue}:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function formatInputDate(
  value: string,
): string {
  const date = new Date(value);

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatInputTime(
  value: string,
): string {
  const date = new Date(value);

  const hours = String(
    date.getHours(),
  ).padStart(2, "0");

  const minutes = String(
    date.getMinutes(),
  ).padStart(2, "0");

  return `${hours}:${minutes}`;
}