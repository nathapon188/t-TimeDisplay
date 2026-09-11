import { dayNames, displayOrder, hours, shortDayNames } from "./hours";

const DAY_MS = 24 * 60 * 60 * 1000;

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Expands the weekly table into absolute {start, end} Date ranges around `now`,
// so shifts that run past midnight are handled without special cases.
function expand(now, daysBack = 1, daysForward = 9) {
  const base = startOfDay(now);
  const ranges = [];
  for (let offset = -daysBack; offset < daysForward; offset++) {
    const day = new Date(base.getTime() + offset * DAY_MS);
    for (const shift of hours[day.getDay()] ?? []) {
      const open = toMinutes(shift.open);
      const close = toMinutes(shift.close);
      const length = close > open ? close - open : close + 1440 - open;
      const start = new Date(day.getTime() + open * 60000);
      ranges.push({ start, end: new Date(start.getTime() + length * 60000) });
    }
  }
  return ranges.sort((a, b) => a.start - b.start);
}

export function getStatus(now = new Date()) {
  const ranges = expand(now);
  const current = ranges.find((r) => now >= r.start && now < r.end);
  if (current) return { open: true, until: current.end };

  const next = ranges.find((r) => r.start > now);
  return { open: false, until: next ? next.start : null };
}

export function formatTime(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h < 12 || h === 24 ? "am" : "pm";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${hour}${suffix}` : `${hour}:${String(m).padStart(2, "0")}${suffix}`;
}

export function formatShift(shift) {
  return `${formatTime(shift.open)} - ${formatTime(shift.close)}`;
}

// "in 2h 15m" style countdown to the next open/close boundary.
export function formatUntil(target, now = new Date()) {
  if (!target) return null;
  const mins = Math.max(0, Math.round((target - now) / 60000));
  const days = Math.floor(mins / 1440);
  const h = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  if (days > 0) return `${days}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// Collapses runs of consecutive days with identical hours into a single row,
// so "Mon Tue Wed Thu Fri" with the same shifts reads as "Mon - Fri".
export function groupDays() {
  const key = (day) => JSON.stringify(hours[day] ?? []);
  const groups = [];

  for (const day of displayOrder) {
    const last = groups[groups.length - 1];
    if (last && key(day) === last.key) {
      last.days.push(day);
    } else {
      groups.push({ key: key(day), days: [day] });
    }
  }

  return groups.map(({ days }) => ({
    days,
    label:
      days.length === 1
        ? dayNames[days[0]]
        : `${shortDayNames[days[0]]} - ${shortDayNames[days[days.length - 1]]}`,
    shifts: hours[days[0]] ?? [],
  }));
}
