import { PrismaClient } from '@prisma/client'
import { hash } from 'bcrypt'

// For Prisma Accelerate, pass the URL as accelerateUrl
const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
})

async function main() {
  console.log('🌱 Seeding database...')

  // Create Admin User with hashed password
  const hashedPassword = await hash('admin123', 10)

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      imageUrl: 'https://avatar.vercel.sh/admin',
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin user created:')
  console.log('   Username: admin')
  console.log('   Password: admin123')
  console.log('   Role:', admin.role)

  // Create some test access codes
  const code1 = await prisma.accessCode.create({
    data: {
      createdById: admin.id,
    },
  })

  const code2 = await prisma.accessCode.create({
    data: {
      createdById: admin.id,
    },
  })

  console.log('✅ Test access codes created:')
  console.log('  -', code1.code)
  console.log('  -', code2.code)

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

