import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const users = await prisma.user.findMany();
  console.log('Users:');
  for (const u of users) {
    console.log(`- ${u.name} (email: ${u.email}, roleId: ${u.roleId})`);
  }
}

test().finally(() => prisma.$disconnect());
