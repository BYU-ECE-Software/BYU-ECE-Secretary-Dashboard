import http from "./http";

// GET /api/date
export async function fetchDates() {
  const { data } = await http.get("/date");
  return data;
}
