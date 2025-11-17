import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// POST Create a Locker
export const createLocker = async (req, res) => {
  const { number, userId, className, endDate } = req.body;

  // Basic validation
  if (!number) {
    return res.status(400).json({ error: "Missing or invalid fields." });
  }

  // Format the data
  try {
    const newLocker = await prisma.locker.create({
      data: {
        number,
        userId,
        className,
        endDate,
      },
    });

    res.status(201).json(newLocker);
  } catch (error) {
    // If a locker with this number already exists, show this error message
    if (error.code === "P2002" && error.meta?.target?.includes("number")) {
      return res.status(409).json({
        error: `Locker #${number} already exists.`,
        code: "LOCKER_ALREADY_EXISTS",
      });
    }

    console.error("Error creating locker:", error);
    res.status(500).json({ error: "Failed to create locker" });
  }
};

// GET Fetch all Lockers
export const getLockers = async (req, res) => {
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
      // purely numeric? -> prefix matching on locker number + user filter
      if (/^\d+$/.test(qRaw)) {
        const p = parseInt(qRaw, 10);

        // Build OR ranges for prefix: [p, p+1), [p*10, (p+1)*10), [p*100, (p+1)*100), ...
        const MAX_EXTRA_DIGITS = 6; // adjust if you have very large locker numbers
        const numberRanges = [];
        for (let k = 0; k <= MAX_EXTRA_DIGITS; k++) {
          const mult = Math.pow(10, k);
          numberRanges.push({
            number: { gte: p * mult, lt: (p + 1) * mult },
          });
        }

        where.OR = [
          // any locker whose number starts with qRaw
          ...numberRanges,
          // OR any locker whose linked user matches the user search (if any terms)
          ...(userWhere ? [{ user: { is: userWhere } }] : []),
        ];
      } else if (userWhere) {
        // text query → just user filter
        where.user = { is: userWhere };
      }
    }

    const lockers = await prisma.locker.findMany({
      where,
      orderBy: { number: "asc" },
      include,
    });

    res.status(200).json(lockers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch lockers" });
  }
};

// PUT Update a locker
export const updateLocker = async (req, res) => {
  const { number } = req.params;
  const { userId, className, endDate } = req.body;

  try {
    const updatedLocker = await prisma.locker.update({
      where: { number: parseInt(number) },
      data: {
        userId,
        className,
        endDate,
      },
    });

    res.status(200).json(updatedLocker);
  } catch (error) {
    // If a student is already assigned to a different locker, show this error message
    if (error.code === "P2002" && error.meta?.target?.includes("userId")) {
      return res.status(409).json({
        error:
          "This person is already assigned to a different locker. They must be removed from that locker before they can be assigned to a new one.",
        code: "USER_ALREADY_ASSIGNED",
      });
    }

    console.error("Error updating locker:", error);
    res.status(500).json({ error: "Failed to update locker." });
  }
};

// DELETE delete a locker
export const deleteLocker = async (req, res) => {
  const { number } = req.params;

  try {
    const deletedLocker = await prisma.locker.delete({
      where: { number: parseInt(number) },
    });

    res
      .status(200)
      .json({ message: "Locker deleted successfully", deletedLocker });
  } catch (error) {
    console.error("Error deleting locker:", error);

    // Handle case where locker doesn't exist
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Locker not found" });
    }

    res.status(500).json({ error: "Failed to delete locker" });
  }
};
