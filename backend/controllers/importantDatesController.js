import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// POST Create a new Date
export const createImportantDate = async (req, res) => {
  const { description, assignedDate, currentOption } = req.body;

  // Basic validation
  if (!description || !assignedDate || typeof currentOption !== "boolean") {
    return res.status(400).json({ error: "Missing or invalid fields." });
  }

  // Format the data
  try {
    const newDate = await prisma.importantDates.create({
      data: {
        description,
        assignedDate,
        currentOption,
      },
    });

    res.status(201).json(newDate);
  } catch (error) {
    console.error("Error creating date:", error);
    res.status(500).json({ error: "Failed to create date" });
  }
};

// GET Fetch all Dates
export const getDates = async (req, res) => {
  try {
    const dates = await prisma.importantDates.findMany({
      orderBy: { assignedDate: "asc" },
    });

    res.status(200).json(dates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch dates " });
  }
};

// PUT Update an important date
export const updateDate = async (req, res) => {
  const { id } = req.params;
  const { description, assignedDate, currentOption } = req.body;

  // Basic validation
  if (!description || !assignedDate || typeof currentOption !== "boolean") {
    return res.status(400).json({ error: "Missing or invalid fields." });
  }

  try {
    const updatedDate = await prisma.importantDates.update({
      where: { id: parseInt(id) },
      data: {
        description,
        assignedDate,
        currentOption,
      },
    });

    res.status(200).json(updatedDate);
  } catch (error) {
    console.error("Error updating date:", error);
    res.status(500).json({ error: "Failed to update date." });
  }
};

// DELETE delete an important date
export const deleteDate = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedDate = await prisma.importantDates.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Date deleted successfully", deletedDate });
  } catch (error) {
    console.error("Error deleting date:", error);

    // Handle case where date doesn't exist
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Date not found" });
    }

    res.status(500).json({ error: "Failed to delete date" });
  }
};
