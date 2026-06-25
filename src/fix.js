const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`ALTER TABLE t_essay_answer ALTER COLUMN is_approved_by_teacher DROP NOT NULL;`);
  console.log('Successfully dropped NOT NULL from is_approved_by_teacher in Supabase!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
