import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@tournament.com',
      imageUrl: 'https://avatar.vercel.sh/admin',
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin user created:', admin.username)

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

