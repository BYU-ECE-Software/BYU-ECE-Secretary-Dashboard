import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const positions = [
    { id: 1, description: "Student" },
    { id: 2, description: "Professor" },
    { id: 3, description: "Staff" },
  ];

  for (const position of positions) {
    await prisma.position.upsert({
      where: { id: position.id },
      update: { description: position.description },
      create: position,
    });
  }

  console.log("✅ Seeded positions");
}

main()
  .catch((e) => {
    console.error("❌ Error while seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
