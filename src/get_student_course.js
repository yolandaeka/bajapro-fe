const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const scs = await prisma.studentCourse.findMany();
  console.log('All StudentCourses in DB:', scs);
}

main().catch(console.error).finally(() => prisma.$disconnect());
