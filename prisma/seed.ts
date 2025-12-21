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

  // Create 10 test players
  console.log('\n👥 Creating 10 test players...')

  const testPlayers = []
  for (let i = 1; i <= 10; i++) {
    const playerPassword = await hash(`player${i}123`, 10)

    // Create access code for player
    const accessCode = await prisma.accessCode.create({
      data: {
        createdById: admin.id,
      },
    })

    // Create player
    const player = await prisma.user.create({
      data: {
        username: `player${i}`,
        password: playerPassword,
        imageUrl: `https://avatar.vercel.sh/player${i}`,
        role: 'USER',
        accessCodeId: accessCode.id,
      },
    })

    testPlayers.push(player)
    console.log(`   ✓ Player ${i}: player${i} (password: player${i}123)`)
  }

  // Create some additional unused access codes
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

  console.log('\n✅ Additional access codes created:')
  console.log('  -', code1.code)
  console.log('  -', code2.code)

  console.log('\n🎉 Seeding completed!')
  console.log(`   Total users: ${testPlayers.length + 1} (1 admin + ${testPlayers.length} players)`)
  console.log('   Total access codes: 12 (10 used + 2 unused)')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

