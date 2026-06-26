const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  
  await prisma.user.updateMany({
    where: {
      email: {
        in: [
          '2241760028@student.polinema.ac.id',
          'coba@gmail.com',
          'siswa@gmai.com'
        ]
      }
    },
    data: {
      password: hashedPassword
    }
  });
  console.log('Successfully set password of student accounts to "admin123"');
}

main().catch(console.error).finally(() => prisma.$disconnect());
