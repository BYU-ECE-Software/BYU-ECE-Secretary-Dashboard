// Always format dates using UTC so the calendar date never shifts.
export function toYMDUTC(value) {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (isNaN(d.getTime())) return "";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${m}/${day}/${y}`; // "MM/DD/YYY"
}

// If you ever need an ISO at UTC midnight for a given date string:
export function ymdToUtcIso(ymd) {
  if (!ymd) return null;
  return new Date(`${ymd}T00:00:00Z`).toISOString();
}
