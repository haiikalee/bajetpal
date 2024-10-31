import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.transaction.deleteMany()
  await prisma.budget.deleteMany()
  await prisma.user.deleteMany()

  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
    },
  })

  // Create budgets
  const budgets = await prisma.budget.createMany({
    data: [
      { userId: user.id, category: 'Food', amount: 500 },
      { userId: user.id, category: 'Transportation', amount: 300 },
      { userId: user.id, category: 'Entertainment', amount: 200 },
      { userId: user.id, category: 'Utilities', amount: 400 },
    ],
  })

  // Create some sample transactions
  const transactions = await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        description: 'Grocery shopping',
        amount: -120.50,
        date: new Date('2024-03-01'),
        category: 'Food',
        type: 'EXPENSE',
      },
      {
        userId: user.id,
        description: 'Monthly salary',
        amount: 5000,
        date: new Date('2024-03-01'),
        category: 'Salary',
        type: 'income',
      },
      {
        userId: user.id,
        description: 'Movie night',
        amount: -30,
        date: new Date('2024-03-02'),
        category: 'Entertainment',
        type: 'expense',
      },
      {
        userId: user.id,
        description: 'Bus fare',
        amount: -25,
        date: new Date('2024-03-03'),
        category: 'Transportation',
        type: 'expense',
      },
      {
        userId: user.id,
        description: 'Electricity bill',
        amount: -150,
        date: new Date('2024-03-04'),
        category: 'Utilities',
        type: 'expense',
      },
    ],
  })

  console.log('Database has been seeded! 🌱')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 