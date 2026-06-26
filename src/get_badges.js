const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const badges = await prisma.badge.findMany();
  console.log('Badges in DB:', badges);
}

main().catch(console.error).finally(() => prisma.$disconnect());
