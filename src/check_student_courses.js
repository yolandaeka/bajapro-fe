const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { roleId: 3 },
    select: { id: true, name: true, email: true }
  });
  console.log('--- Students ---');
  console.log(users);

  const studentCourses = await prisma.studentCourse.findMany();
  console.log('--- Student Courses ---');
  console.log(studentCourses);

  const progress = await prisma.studentProgress.findMany();
  console.log('--- Student Progress Count ---', progress.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
