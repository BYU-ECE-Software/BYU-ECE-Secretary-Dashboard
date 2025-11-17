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
    const users = await prisma.user.findMany({
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      include: {
        position: true,
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

// DELETE delete a user
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "User deleted successfully", deletedUser });
  } catch (error) {
    console.error("Error deleting user:", error);

    // Handle case where user doesn't exist
    if (error.code === "P2025") {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(500).json({ error: "Failed to delete user" });
  }
};
