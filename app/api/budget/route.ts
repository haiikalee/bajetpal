import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/options'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const budgets = await prisma.budget.findMany({
      where: {
        userId: session.user.id
      }
    })

    return NextResponse.json(budgets || [])
  } catch (error) {
    console.error('Error in GET /api/budget:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const budget = await prisma.budget.create({
    data: {
      category: body.category,
      amount: body.amount,
      user: {
        connect: {
          id: session.user.id
        }
      }
    },
  })
  return NextResponse.json(budget)
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const budget = await prisma.budget.update({
    where: { id: body.id },
    data: {
      category: body.category,
      amount: body.amount,
    },
  })
  return NextResponse.json(budget)
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = parseInt(searchParams.get('id') || '')

    if (!id || isNaN(id)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 })
    }

    // Verify the budget belongs to the user
    const budget = await prisma.budget.findUnique({
      where: { id },
      select: { userId: true }
    })

    if (!budget) {
      return NextResponse.json({ message: 'Budget not found' }, { status: 404 })
    }

    if (budget.userId !== session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 })
    }

    await prisma.budget.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Budget deleted successfully' })
  } catch (error) {
    console.error('Error in DELETE /api/budget:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'An error occurred' }, 
      { status: 500 }
    )
  }
}