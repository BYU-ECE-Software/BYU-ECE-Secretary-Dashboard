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

// GET /api/user/:id/delete-check -> returns any connections a user may have (locker, grad lab space, keys, etc.)
export async function getUserDeleteCheck(id) {
  const { data } = await http.get(`/user/${id}/delete-check`);
  return data;
}

// DELETE /api/user/:id -> delete a single user
export async function deleteUser(id) {
  const { data } = await http.delete(`/user/${id}`);
  return data;
}

// DELETE /api/user/bulk-delete -> delete multiple users
export async function deleteUsersBulk(ids) {
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("deleteUsersBulk requires a non-empty array of ids");
  }

  const { data } = await http.delete("/user/bulk-delete", {
    data: { ids },
  });

  return data;
}
