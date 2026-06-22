const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  await prisma.$executeRawUnsafe("SELECT setval(pg_get_serial_sequence('m_sub_lesson', 'id'), coalesce(max(id),0) + 1, false) FROM m_sub_lesson;");
  await prisma.$executeRawUnsafe("SELECT setval(pg_get_serial_sequence('m_lesson', 'id'), coalesce(max(id),0) + 1, false) FROM m_lesson;");
  await prisma.$executeRawUnsafe("SELECT setval(pg_get_serial_sequence('m_course', 'id'), coalesce(max(id),0) + 1, false) FROM m_course;");
  await prisma.$executeRawUnsafe("SELECT setval(pg_get_serial_sequence('m_materials', 'id'), coalesce(max(id),0) + 1, false) FROM m_materials;");
  console.log("Fixed sequences!");
}

fix()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
