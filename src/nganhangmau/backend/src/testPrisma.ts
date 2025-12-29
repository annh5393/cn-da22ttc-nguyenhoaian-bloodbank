import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const donors = await prisma.nguoihienmau.findMany();
  console.log(donors);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
