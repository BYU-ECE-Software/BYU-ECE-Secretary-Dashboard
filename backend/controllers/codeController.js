import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// POST Create a Code
export const createCode = async (req, res) => {
  const { value, isGlobal } = req.body;

  // Basic validation
  if (!value || typeof isGlobal !== "boolean") {
    return res.status(400).json({ error: "Missing or invalid fields." });
  }

  // Format the data
  try {
    const newCode = await prisma.code.create({
      data: {
        value,
        isGlobal,
      },
    });

    res.status(201).json(newCode);
  } catch (error) {
    console.error("Error creating code:", error);
    res.status(500).json({ error: "Failed to create code" });
  }
};

// GET Fetch all Codes
export const getCodes = async (req, res) => {
  try {
    const codes = await prisma.code.findMany({
      orderBy: {
        value: "asc",
      },
    });

    res.status(200).json(codes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch codes " });
  }
};

// PUT Update a code
export const updateCode = async (req, res) => {
  const { id } = req.params;
  const { value, isGlobal } = req.body;

  //Basic Validation
  if (!value || typeof isGlobal !== "boolean") {
    return res.status(400).json({ error: "Missing required fields. " });
  }

  try {
    const updatedCode = await prisma.code.update({
      where: { id: parseInt(id) },
      data: {
        value,
        isGlobal,
      },
    });

    res.status(200).json(updatedCode);
  } catch (error) {
    console.error("Error updating code:", error);
    res.status(500).json({ error: "Failed to update code." });
  }
};

// DELETE delete a code
export const deleteCode = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCode = await prisma.code.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: "Code deleted successfully", deletedCode });
  } catch (error) {
    console.error("Error deleting code:", error);

    // Handle case where code doesn't exist
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Code not found" });
    }

    res.status(500).json({ error: "Failed to delete code" });
  }
};
