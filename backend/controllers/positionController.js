import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// POST Create a Position
export const createPosition = async (req, res) => {
  const { description } = req.body;

  // Basic validation
  if (!description) {
    return res.status(400).json({ error: "Missing or invalid fields." });
  }

  // Format the data
  try {
    const newPosition = await prisma.position.create({
      data: {
        description,
      },
    });

    res.status(201).json(newPosition);
  } catch (error) {
    console.error("Error creating position:", error);
    res.status(500).json({ error: "Failed to create position" });
  }
};

// GET Fetch all Positions
export const getPositions = async (req, res) => {
  try {
    const positions = await prisma.position.findMany({
      orderBy: {
        description: "asc",
      },
    });

    res.status(200).json(positions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch positions " });
  }
};

// PUT Update a position
export const updatePosition = async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;

  //Basic Validation
  if (!description) {
    return res.status(400).json({ error: "Missing required fields. " });
  }

  try {
    const updatedPosition = await prisma.position.update({
      where: { id: parseInt(id) },
      data: {
        description,
      },
    });

    res.status(200).json(updatedPosition);
  } catch (error) {
    console.error("Error updating position:", error);
    res.status(500).json({ error: "Failed to update position." });
  }
};

// DELETE delete a position
export const deletePosition = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedPosition = await prisma.position.delete({
      where: { id: parseInt(id) },
    });

    res
      .status(200)
      .json({ message: "Position deleted successfully", deletedPosition });
  } catch (error) {
    console.error("Error deleting position:", error);

    // Handle case where position doesn't exist
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Position not found" });
    }

    res.status(500).json({ error: "Failed to delete position" });
  }
};
