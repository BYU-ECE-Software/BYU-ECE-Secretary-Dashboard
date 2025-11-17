import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// POST Create a Desk
export const createDesk = async (req, res) => {
  const { number, studentId, statusId, endDate, professorId } = req.body;

  // Basic validation
  if (!number || !statusId) {
    return res.status(400).json({ error: "Missing or invalid fields." });
  }

  // Format the data
  try {
    const newDesk = await prisma.desk.create({
      data: {
        number,
        studentId,
        statusId,
        endDate,
        professorId,
      },
    });

    res.status(201).json(newDesk);
  } catch (error) {
    console.error("Error creating desk:", error);
    res.status(500).json({ error: "Failed to create desk" });
  }
};

// GET Fetch all Desks
export const getDesks = async (req, res) => {
  try {
    const desks = await prisma.desk.findMany({
      orderBy: { number: "asc" },
      include: {
        student: true,
        status: true,
        professor: true,
      },
    });

    res.status(200).json(desks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch desks " });
  }
};

// PUT Update a desk
export const updateDesk = async (req, res) => {
  const { number } = req.params;
  const { studentId, statusId, endDate, professorId } = req.body;

  //Basic Validation
  if (!statusId) {
    return res.status(400).json({ error: "Missing required fields. " });
  }

  try {
    const updatedDesk = await prisma.desk.update({
      where: { number: parseInt(number) },
      data: {
        studentId,
        statusId,
        endDate,
        professorId,
      },
    });

    res.status(200).json(updatedDesk);
  } catch (error) {
    console.error("Error updating desk:", error);
    res.status(500).json({ error: "Failed to update desk." });
  }
};

// DELETE delete a desk
export const deleteDesk = async (req, res) => {
  const { number } = req.params;

  try {
    const deletedDesk = await prisma.desk.delete({
      where: { number: parseInt(number) },
    });

    res.status(200).json({ message: "Desk deleted successfully", deletedDesk });
  } catch (error) {
    console.error("Error deleting desk:", error);

    // Handle case where desk doesn't exist
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Desk not found" });
    }

    res.status(500).json({ error: "Failed to delete desk" });
  }
};
