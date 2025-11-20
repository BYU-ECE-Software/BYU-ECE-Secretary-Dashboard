import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// POST Create a Key
export const createKey = async (req, res) => {
  const { number, userId } = req.body;

  // Basic validation
  if (!number) {
    return res.status(400).json({ error: "Missing or invalid fields." });
  }

  // Format the data
  try {
    const newKey = await prisma.key.create({
      data: {
        number,
        userId,
      },
    });

    res.status(201).json(newKey);
  } catch (error) {
    // If a key with this number already exists, show this error message
    if (error.code === "P2002" && error.meta?.target?.includes("number")) {
      return res.status(409).json({
        error: `Key #${number} already exists.`,
        code: "KEY_ALREADY_EXISTS",
      });
    }

    console.error("Error creating key:", error);
    res.status(500).json({ error: "Failed to create key" });
  }
};

// GET Fetch all Keys
export const getKeys = async (req, res) => {
  try {
    const qRaw = (req.query.q ?? "").toString().trim();

    // user search: split tokens, AND across tokens, OR across first/last/email
    const terms = qRaw ? qRaw.split(/[\s,]+/).filter(Boolean) : [];
    const userWhere = terms.length
      ? {
          AND: terms.map((term) => ({
            OR: [
              { firstName: { contains: term, mode: "insensitive" } },
              { lastName: { contains: term, mode: "insensitive" } },
              { email: { contains: term, mode: "insensitive" } },
            ],
          })),
        }
      : null;

    const where = {};
    const include = { user: true };

    if (qRaw) {
      // purely numeric? -> prefix matching on key number + user filter
      if (/^\d+$/.test(qRaw)) {
        const p = parseInt(qRaw, 10);

        // Build OR ranges for prefix: [p, p+1), [p*10, (p+1)*10), [p*100, (p+1)*100), ...
        const MAX_EXTRA_DIGITS = 6; // adjust if you have very large key numbers
        const numberRanges = [];
        for (let k = 0; k <= MAX_EXTRA_DIGITS; k++) {
          const mult = Math.pow(10, k);
          numberRanges.push({
            number: { gte: p * mult, lt: (p + 1) * mult },
          });
        }

        where.OR = [
          // any key whose number starts with qRaw
          ...numberRanges,
          // OR any key whose linked user matches the user search (if any terms)
          ...(userWhere ? [{ user: { is: userWhere } }] : []),
        ];
      } else if (userWhere) {
        // text query → just user filter
        where.user = { is: userWhere };
      }
    }

    const keys = await prisma.key.findMany({
      where,
      orderBy: { number: "asc" },
      include,
    });

    res.status(200).json(keys);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch keys" });
  }
};

// GET Fetch a single Key by number
export const getKeyByNumber = async (req, res) => {
  const { number } = req.params;
  const n = Number.parseInt(number, 10);

  // Basic param validation
  if (!Number.isFinite(n) || n <= 0) {
    return res.status(400).json({ error: "Invalid key number." });
  }

  try {
    const key = await prisma.key.findUnique({
      where: { number: n },
      include: { user: true }, // include current user assignment
    });

    if (!key) {
      return res.status(404).json({ error: "Key not found" });
    }

    res.status(200).json(key);
  } catch (error) {
    console.error("Error fetching key by number:", error);
    res.status(500).json({ error: "Failed to fetch key" });
  }
};

// PUT Update a key
export const updateKey = async (req, res) => {
  const { number } = req.params;
  const { userId } = req.body;

  // Build a data object dynamically so userId is optional
  const data = {};

  // Only touch userId if the caller actually sent it (even if it's null)
  if (Object.prototype.hasOwnProperty.call(req.body, "userId")) {
    data.userId = userId; // can be number or null
  }

  // Guard: nothing to update at all
  if (Object.keys(data).length === 0) {
    return res.status(400).json({
      error: "No updatable fields were provided.",
    });
  }

  try {
    const updatedKey = await prisma.key.update({
      where: { number: parseInt(number, 10) },
      data,
    });

    res.status(200).json(updatedKey);
  } catch (error) {
    console.error("Error updating key:", error);
    res.status(500).json({ error: "Failed to update key." });
  }
};

// DELETE delete a key
export const deleteKey = async (req, res) => {
  const { number } = req.params;

  try {
    const deletedKey = await prisma.key.delete({
      where: { number: parseInt(number) },
    });

    res.status(200).json({ message: "Key deleted successfully", deletedKey });
  } catch (error) {
    console.error("Error deleting key:", error);

    // Handle case where key doesn't exist
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Key not found" });
    }

    res.status(500).json({ error: "Failed to delete key" });
  }
};
