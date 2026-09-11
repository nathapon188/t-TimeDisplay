// Edit this file to match the venue.
// Times are 24-hour "HH:MM". A close time earlier than (or equal to) the open
// time means the shift runs past midnight, e.g. { open: "18:00", close: "01:00" }.
// An empty array means closed all day. Multiple entries give split trading.

export const venue = {
  name: "Tamrab Thai",
  logo: "/logo.png",
};

const weekday = [
  { open: "06:30", close: "15:00" },
  { open: "16:30", close: "21:00" },
];

const weekend = [
  { open: "08:00", close: "15:00" },
  { open: "16:30", close: "21:00" },
];

export const hours = {
  0: weekend, // Sunday
  1: weekday,
  2: weekday,
  3: weekday,
  4: weekday,
  5: weekday,
  6: weekend, // Saturday
};

export const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const shortDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Monday-first, which is how the hours are usually read off a door.
export const displayOrder = [1, 2, 3, 4, 5, 6, 0];
