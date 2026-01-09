import http from "./http";

// GET /api/date
export async function fetchDates() {
  const { data } = await http.get("/date");
  return data;
}

// POST /api/date - create a new important date
export async function createImportantDate({
  description,
  assignedDate,
  currentOption,
}) {
  const { data } = await http.post("/date", {
    description,
    assignedDate,
    currentOption,
  });
  return data;
}
