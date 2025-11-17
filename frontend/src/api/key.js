import http from "./http";

// GET /api/key -> array of keys with associated user
export async function fetchKeys(opts = {}) {
  const { data } = await http.get("/key", {
    signal: opts.signal, // optional: lets you cancel in-flight requests
  });
  return data;
}

// GET /api/key/:number -> single key (or null if not found)
export async function getKeyByNumber(number, opts = {}) {
  if (number == null) {
    throw new Error("number (path param) is required to fetch a key");
  }
  try {
    const { data } = await http.get(`/key/${number}`, {
      signal: opts.signal,
    });
    return data; // { number, user: {...} | null }
  } catch (err) {
    if (err?.response?.status === 404) return null; // not found → null
    throw err;
  }
}

// POST /api/key -> create a key
export async function createKey(payload) {
  if (!payload || payload.number == null) {
    throw new Error("number is required to create a key");
  }
  const { data } = await http.post("/key", payload);
  return data;
}

// PUT /api/key/:number -> update a key
export async function updateKey(number, payload) {
  if (number == null) {
    throw new Error("number (path param) is required to update a key");
  }
  const { data } = await http.put(`/key/${number}`, payload);
  return data;
}

// DELETE /api/key/:number -> delete a key
export async function deleteKey(number) {
  if (number == null) {
    throw new Error("number (path param) is required to delete a key");
  }
  const { data } = await http.delete(`/key/${number}`);
  return data;
}
