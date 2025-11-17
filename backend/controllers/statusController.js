import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// POST Create a Status
export const createStatus = async (req, res) => {
  const { description } = req.body;

  // Basic validation
  if (!description) {
    return res.status(400).json({ error: "Missing or invalid fields." });
  }

  // Format the data
  try {
    const newStatus = await prisma.status.create({
      data: {
        description,
      },
    });

    res.status(201).json(newStatus);
  } catch (error) {
    console.error("Error creating status:", error);
    res.status(500).json({ error: "Failed to create status" });
  }
};

// GET Fetch all Statuses
export const getStatuses = async (req, res) => {
  try {
    const statuses = await prisma.status.findMany({
      orderBy: {
        description: "asc",
      },
    });

    res.status(200).json(statuses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch statuses " });
  }
};

// PUT Update a status
export const updateStatus = async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;

  //Basic Validation
  if (!description) {
    return res.status(400).json({ error: "Missing required fields. " });
  }

  try {
    const updatedStatus = await prisma.status.update({
      where: { id: parseInt(id) },
      data: {
        description,
      },
    });

    res.status(200).json(updatedStatus);
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Failed to update status." });
  }
};

// DELETE delete a status
export const deleteStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedStatus = await prisma.status.delete({
      where: { id: parseInt(id) },
    });

    res
      .status(200)
      .json({ message: "Status deleted successfully", deletedStatus });
  } catch (error) {
    console.error("Error deleting status:", error);

    // Handle case where status doesn't exist
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Status not found" });
    }

    res.status(500).json({ error: "Failed to delete status" });
  }
};
