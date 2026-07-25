import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@digitalheroes.com';
  const password = 'password123';
  
  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  
  if (existingAdmin) {
    console.log('Admin user already exists.');
    return;
  }

  const password_hash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      email,
      password_hash
    }
  });

  console.log('Created admin user:', admin.email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
