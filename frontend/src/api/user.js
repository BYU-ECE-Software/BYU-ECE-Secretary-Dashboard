import http from "./http";

// GET /api/user -> returns all users, optionally filtered by positionId and search query
export async function fetchUsers(positionId, q) {
  const params = {};

  if (positionId !== undefined && positionId !== null) {
    params.positionId = positionId;
  }

  if (q && q.trim()) {
    params.q = q.trim();
  }

  const { data } = await http.get("/user", { params });
  return data;
}

// GET /api/user/search
export async function searchUsers(q, { limit = 20, positionId, signal } = {}) {
  if (!q || !q.trim()) {
    return { results: [], hasMore: false };
  }

  const params = { q: q.trim(), limit };
  if (positionId !== undefined) params.positionId = positionId;

  const path = "/user/search";

  const { data } = await http.get(path, { params, signal });
  return data;
}

// POST /api/user -> create a user
export async function createUser(userData) {
  const { data } = await http.post("/user", userData);
  return data;
}

// PUT /api/user/:id -> update a user
export async function updateUser(id, userData) {
  const { data } = await http.put(`/user/${id}`, userData);
  return data;
}
