import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const transactions = await prisma.$transaction(async (tx) => {
      return await tx.transaction.findMany({
        orderBy: { date: 'desc' },
      })
    })
    
    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Transaction error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  const body = await request.json()
  
  try {
    // Use a transaction to ensure both operations complete or neither does
    const result = await prisma.$transaction(async (prisma) => {
      // Create the transaction
      const transaction = await prisma.transaction.create({
        data: {
          description: body.description,
          amount: body.amount,
          date: new Date(body.date),
          category: body.category,
          type: body.type,
          user: {
            connect: { id: body.userId }
          }
        },
      })

      // If it's an expense, update the corresponding budget
      if (body.type === 'expense') {
        await prisma.budget.updateMany({
          where: {
            category: body.category,
            userId: body.userId
          },
          data: {
            spent: {
              increment: Math.abs(body.amount)
            }
          }
        })
      }

      return transaction
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Transaction error:', error)
    return NextResponse.json({ error: 'Error creating transaction' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const transaction = await prisma.transaction.update({
    where: {
      id: body.id  // Now getting id from the body instead of params
    },
    data: {
      description: body.description,
      amount: body.amount,
      date: new Date(body.date),
      category: body.category,
    },
  })
  return NextResponse.json(transaction)
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id') || '')

    if (!id || isNaN(id)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
    }

    const transaction = await prisma.transaction.delete({
      where: {
        id: id
      },
    })
    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error in DELETE /api/transactions:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An error occurred' }, 
      { status: 500 }
    )
  }
}