import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// POST Create a Room
export const createRoom = async (req, res) => {
  const { name } = req.body;

  // Basic validation
  if (!name) {
    return res.status(400).json({ error: "Missing or invalid fields." });
  }

  // Format the data
  try {
    const newRoom = await prisma.room.create({
      data: {
        name,
      },
    });

    res.status(201).json(newRoom);
  } catch (error) {
    console.error("Error creating room:", error);
    res.status(500).json({ error: "Failed to create room" });
  }
};

// GET Fetch all Rooms
export const getRooms = async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.status(200).json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch rooms " });
  }
};

// PUT Update a room
export const updateRoom = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  //Basic Validation
  if (!name) {
    return res.status(400).json({ error: "Missing required fields. " });
  }

  try {
    const updatedRoom = await prisma.room.update({
      where: { id: parseInt(id) },
      data: {
        name,
      },
    });

    res.status(200).json(updatedRoom);
  } catch (error) {
    console.error("Error updating room:", error);
    res.status(500).json({ error: "Failed to update room." });
  }
};

// DELETE delete a room
export const deleteRoom = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedRoom = await prisma.room.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Room deleted successfully", deletedRoom });
  } catch (error) {
    console.error("Error deleting room:", error);

    // Handle case where room doesn't exist
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Room not found" });
    }

    res.status(500).json({ error: "Failed to delete room" });
  }
};
