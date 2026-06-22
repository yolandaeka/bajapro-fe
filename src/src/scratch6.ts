import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const perms = await prisma.permission.findMany();
  console.log('Permissions:', perms.map(p => p.name));
}

test().finally(() => prisma.$disconnect());
