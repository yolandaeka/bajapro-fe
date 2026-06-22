import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const perm = await prisma.permission.findFirst({
    where: { name: 'user.read' },
    include: { roles: true }
  });
  console.log('user.read roles:', perm?.roles.map(r => r.id));
}

test().finally(() => prisma.$disconnect());
