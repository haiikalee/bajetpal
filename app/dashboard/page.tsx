'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sidebar } from '../components/Sidebar'

interface Transaction {
  id: number
  description: string
  amount: number
  date: string
  category: string
}

interface Budget {
  id: number
  category: string
  amount: number
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const { data: session, status } = useSession()
  const router = useRouter()

  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/budget')
      if (!response.ok) {
        throw new Error('Failed to fetch budgets')
      }
      const data = await response.json()
      console.log('Budgets data:', data)
      if (Array.isArray(data)) {
        setBudgets(data)
      } else {
        console.error('Budgets data is not an array:', data)
        setBudgets([])
      }
    } catch (error) {
      console.error('Error fetching budgets:', error)
      setBudgets([])
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions')
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      const data = await response.json()
      if (Array.isArray(data)) {
        setTransactions(data)
      } else {
        setTransactions([])
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setTransactions([])
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
    } else if (session) {
      fetchBudgets()
      fetchTransactions()
    }
  }, [session, status, router])

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  const calculateTotalIncome = () => {
    return transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const calculateTotalExpenses = () => {
    return transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  }

  const calculateBalance = () => {
    return calculateTotalIncome() - calculateTotalExpenses()
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Income</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">${calculateTotalIncome().toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">${calculateTotalExpenses().toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">${calculateBalance().toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {transactions.slice(0, 5).map(transaction => (
                  <li key={transaction.id} className="flex justify-between items-center">
                    <span>{transaction.description}</span>
                    <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                      ${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Budget Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {Array.isArray(budgets) && budgets.length > 0 ? (
                  budgets.map(budget => (
                    <li key={budget.id} className="flex justify-between items-center">
                      <span>{budget.category}</span>
                      <span>${budget.amount.toFixed(2)}</span>
                    </li>
                  ))
                ) : (
                  <li>No budgets found</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}