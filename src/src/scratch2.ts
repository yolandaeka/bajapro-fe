import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const perm = await prisma.permission.update({
    where: { id: 6 }, // course.create
    data: {
      roles: {
        set: [{ id: 1 }, { id: 3 }] // Admin and Teacher
      }
    },
    include: { roles: true }
  });
  console.log('course.create roles:', perm.roles.map(r => r.id));
}

test().finally(() => prisma.$disconnect());
