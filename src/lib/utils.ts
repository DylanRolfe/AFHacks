export function dateLabel(value: string, year = false) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    ...(year ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}
export function daysUntil(value: string, now = new Date()) {
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  return Math.ceil((Date.parse(`${value}T00:00:00Z`) - today) / 86400000);
}
export function deadlineLabel(value: string) {
  const days = daysUntil(value);
  return days < 0
    ? "Closed"
    : days === 0
      ? "Closes today"
      : `${days} days remaining`;
}
export function reviewDate(value: string) {
  return new Date(Date.parse(`${value}T12:00:00Z`) - 2 * 86400000)
    .toISOString()
    .slice(0, 10);
}
export const normalize = (s: string) =>
  s
    .toLocaleLowerCase("en-CA")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
