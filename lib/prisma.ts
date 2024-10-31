import { PrismaClient } from '@prisma/client'

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  // In development, create a new instance if it doesn't exist
  prisma = new PrismaClient()
}

export default prisma