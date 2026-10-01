/**
 * Whole calendar days between today (local midnight) and the timestamp's
 * local date. 0 = due today, 1 = due tomorrow, -1 = overdue since yesterday.
 *
 * This is the ONE way the app counts "days left" — every surface (student
 * due chips, teacher needs-attention, nudge messages) must agree, and a
 * 24-hour-bucket math (Math.round/ceil of ms diffs) demonstrably did not:
 * the same deadline read "due today" in one card and "due tomorrow" in
 * another depending on the time of day. Calendar dates are what people mean.
 */
export function calendarDaysUntil(ts: number): number {
  const now = new Date();
  const due = new Date(ts);
  const a = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const b = Date.UTC(due.getFullYear(), due.getMonth(), due.getDate());
  return Math.round((b - a) / 86_400_000);
}
