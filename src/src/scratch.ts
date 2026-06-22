import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.permission.findMany().then(perms => {
  console.log(perms);
  prisma.$disconnect();
});
