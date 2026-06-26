const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const answers = await prisma.codeAnswer.findMany({
    where: { userId: 23 }
  });
  console.log('Code answers for student 23 in DB:', answers);
}

main().catch(console.error).finally(() => prisma.$disconnect());
