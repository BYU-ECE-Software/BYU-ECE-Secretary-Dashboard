import http from "./http";

// Small helper: normalize endDate to ISO (Prisma DateTime likes ISO strings)
function normalizePayload(payload = {}) {
  const out = { ...payload };
  if (out.endDate) {
    // Accept Date, ISO string, or <input type="datetime-local"> value
    const d = new Date(out.endDate);
    if (!Number.isNaN(d.valueOf())) out.endDate = d.toISOString();
  }
  return out;
}

// GET /api/locker -> array of lockers with associated user
export async function fetchLockers({ q } = {}, opts = {}) {
  // If q is empty/undefined, backend returns all lockers
  return http
    .get("/locker", {
      params: q ? { q } : undefined,
      signal: opts.signal, // allow request cancellation
    })
    .then((res) => res.data);
}

// POST /api/locker -> create a locker
export async function createLocker(payload) {
  if (!payload || payload.number == null) {
    throw new Error("number is required to create a locker");
  }
  const { data } = await http.post("/locker", normalizePayload(payload));
  return data;
}

// PUT /api/locker/:number -> update a locker
export async function updateLocker(number, payload) {
  if (number == null) {
    throw new Error("number (path param) is required to update a locker");
  }
  const { data } = await http.put(
    `/locker/${number}`,
    normalizePayload(payload)
  );
  return data;
}

// DELETE /api/locker/:number -> delete a locker
export async function deleteLocker(number) {
  if (number == null) {
    throw new Error("number (path param) is required to delete a locker");
  }
  const { data } = await http.delete(`/locker/${number}`);
  return data;
}
