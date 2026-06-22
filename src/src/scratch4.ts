import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const roles = await prisma.role.findMany();
  console.log('Roles:', roles);
}

test().finally(() => prisma.$disconnect());
