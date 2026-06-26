const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { role: true }
  });
  console.log('--- Users in DB ---');
  users.forEach(u => {
    console.log(`ID: ${u.id}, Name: ${u.name}, Email: ${u.email}, Password: ${u.password}, Role: ${u.role?.roleName || u.roleId}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
