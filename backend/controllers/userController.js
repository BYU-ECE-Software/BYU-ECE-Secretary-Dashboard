import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// POST Create a User
export const createUser = async (req, res) => {
  const { firstName, lastName, email, byuId, netId, positionId } = req.body;

  // Basic validation
  if (!firstName || !lastName || !email || !positionId) {
    return res.status(400).json({ error: "Missing or invalid fields." });
  }

  // Format the data
  try {
    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        byuId,
        netId,
        positionId,
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

// GET Fetch all Users
export const getUsers = async (req, res) => {
  try {
    const { positionId } = req.query;

    // New: optional search query
    const qRaw = (req.query.q ?? "").toString().trim();

    // user search: split tokens, AND across tokens, OR across fields
    const terms = qRaw ? qRaw.split(/[\s,]+/).filter(Boolean) : [];
    const userWhere = terms.length
      ? {
          AND: terms.map((term) => ({
            OR: [
              { firstName: { contains: term, mode: "insensitive" } },
              { lastName: { contains: term, mode: "insensitive" } },
              { email: { contains: term, mode: "insensitive" } },
              { byuId: { contains: term, mode: "insensitive" } },
              { netId: { contains: term, mode: "insensitive" } },
            ],
          })),
        }
      : null;

    // Combine existing positionId filter with optional search
    const andFilters = [];

    if (positionId) {
      andFilters.push({ positionId: Number(positionId) });
    }

    if (userWhere) {
      andFilters.push(userWhere);
    }

    const where = andFilters.length ? { AND: andFilters } : undefined;

    const users = await prisma.user.findMany({
      // Optional filter: filter by PositionId (student, professor, etc)
      where,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: {
        position: true,
        locker: true,
      },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch users " });
  }
};

// GET searches for users by name or email
export const searchUsers = async (req, res) => {
  try {
    const q = (req.query.q || "").toString().trim();
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const positionId = req.query.positionId
      ? Number(req.query.positionId)
      : undefined;

    if (!q) return res.status(200).json({ results: [], hasMore: false });

    // split query on spaces/commas
    const terms = q.split(/[\s,]+/).filter(Boolean);

    const results = await prisma.user.findMany({
      where: {
        AND: terms.map((term) => ({
          OR: [
            { firstName: { contains: term, mode: "insensitive" } },
            { lastName: { contains: term, mode: "insensitive" } },
            { email: { contains: term, mode: "insensitive" } },
          ],
        })),
        ...(positionId ? { positionId } : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        byuId: true,
        netId: true,
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      take: limit + 1,
    });

    const hasMore = results.length > limit;
    res.status(200).json({
      results: results.slice(0, limit),
      hasMore,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to search users" });
  }
};

// PUT Update a user
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, byuId, netId, positionId } = req.body;

  //Basic Validation
  if (!firstName || !lastName || !email || !positionId) {
    return res.status(400).json({ error: "Missing required fields. " });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        firstName,
        lastName,
        email,
        byuId,
        netId,
        positionId,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user." });
  }
};

// Preflight endpoint. Warn frontend what connections are present between user and other tables
export const getUserDeleteCheck = async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,

        locker: { select: { number: true, endDate: true } },
        desksAsStudent: { select: { number: true, endDate: true } },
        desksAsProfessor: { select: { number: true, endDate: true } },

        keys: { select: { number: true } },
        roomAccess: { select: { roomId: true } },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      user: { id: user.id, name: `${user.firstName} ${user.lastName}` },
      connections: {
        locker: user.locker, // null or {number,endDate}
        deskAsStudent: user.desksAsStudent, // null or {number,endDate}
        desksAsProfessor: user.desksAsProfessor, // [] or list
        keysCount: user.keys.length,
        roomAccessCount: user.roomAccess.length,
      },
      canDelete: true, // you can later flip this if you decide “must resolve locker first”
    });
  } catch (err) {
    console.error("delete-check error:", err);
    res.status(500).json({ error: "Failed to check user connections" });
  }
};

// clean up any foreign key relationships that a user has before they are deleted
async function clearUserConnections(tx, ids) {
  // lockers
  await tx.locker.updateMany({
    where: { userId: { in: ids } },
    data: { userId: null },
  });

  // keys
  await tx.key.updateMany({
    where: { userId: { in: ids } },
    data: { userId: null },
  });

  // desks (student + professor)
  await tx.desk.updateMany({
    where: { studentId: { in: ids } },
    data: { studentId: null },
  });

  await tx.desk.updateMany({
    where: { professorId: { in: ids } },
    data: { professorId: null },
  });

  // room access join table
  await tx.studentRoomAccess.deleteMany({
    where: { userId: { in: ids } },
  });
}

// DELETE a single user
export const deleteUser = async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const deletedUser = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({ where: { id } });
      if (!existing) {
        return null;
      }

      await clearUserConnections(tx, [id]);

      return tx.user.delete({ where: { id } });
    });

    if (!deletedUser) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ message: "User deleted successfully", deletedUser });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// DELETE users in bulk
export const deleteUsersBulk = async (req, res) => {
  const ids = (req.body?.ids ?? [])
    .map((n) => parseInt(n, 10))
    .filter((n) => Number.isFinite(n));

  if (!ids.length) return res.status(400).json({ error: "No ids provided" });

  try {
    const result = await prisma.$transaction(async (tx) => {
      await clearUserConnections(tx, ids);
      return tx.user.deleteMany({ where: { id: { in: ids } } });
    });

    res.json({
      message: "Users deleted successfully",
      deletedCount: result.count,
    });
  } catch (err) {
    console.error("bulk delete error:", err);
    res.status(500).json({ error: "Failed to delete users" });
  }
};
