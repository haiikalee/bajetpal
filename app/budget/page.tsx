'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, Edit, Trash } from 'lucide-react'
import { Sidebar } from '../components/Sidebar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BudgetInsights } from '../components/BudgetInsights'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Budget {
  id: number
  category: string
  amount: number
  userId: string
}

interface Transaction {
  id: number
  description: string
  amount: number
  date: string
  category: string
  type: 'income' | 'expense'
  userId: string
}

const expenseCategories = ['Food', 'Transportation', 'Utilities', 'Entertainment', 'Other Expenses']

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [newCategory, setNewCategory] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const { data: session, status } = useSession()
  const router = useRouter()

  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/budget')
      const data = await response.json()
      setBudgets(data)
    } catch (error) {
      console.error('Error fetching budgets:', error)
    }
  }

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions')
      const data = await response.json()
      setTransactions(data)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchBudgets()
      fetchTransactions()
    }
  }, [session])

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  const handleAddOrUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/budget', {
        method: editingBudget ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: editingBudget?.id,
          category: newCategory, 
          amount: parseFloat(newAmount),
          userId: session.user.id
        }),
      })
      if (response.ok) {
        fetchBudgets()
        setIsModalOpen(false)
        setEditingBudget(null)
        setNewCategory('')
        setNewAmount('')
      }
    } catch (error) {
      console.error('Error adding/updating budget:', error)
    }
  }

  const handleDeleteBudget = async (id: number) => {
    try {
      const response = await fetch(`/api/budget?id=${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchBudgets()
      }
    } catch (error) {
      console.error('Error deleting budget:', error)
    }
  }

  const calculateSpent = (category: string) => {
    return transactions
      .filter(t => 
        t.category === category && 
        t.type === 'expense'
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  }

  const calculatePercentageUsed = (budget: Budget) => {
    const spent = calculateSpent(budget.category)
    const percentage = (spent / budget.amount) * 100
    
    return {
      spent,
      percentage,
      status: percentage >= 90 ? 'danger' : percentage >= 75 ? 'warning' : 'safe'
    }
  }

  const getMonthlyStats = () => {
    return budgets.map(budget => {
      const monthlyTransactions = transactions.filter(t => 
        t.category === budget.category && 
        t.type === 'expense' && 
        new Date(t.date).getMonth() === selectedMonth
      )
      
      const spent = monthlyTransactions.reduce((sum, t) => 
        sum + Math.abs(t.amount), 0
      )
      
      return {
        ...budget,
        spent,
        remaining: budget.amount - spent
      }
    })
  }

  const openEditModal = (budget: Budget) => {
    setEditingBudget(budget)
    setNewCategory(budget.category)
    setNewAmount(budget.amount.toString())
    setIsModalOpen(true)
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Budget</h2>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Budget Category
          </Button>
        </div>

        {budgets.length > 0 && (
          <BudgetInsights budgets={budgets} transactions={transactions} />
        )}

        <Tabs defaultValue="overview" className="mb-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="monthly">Monthly View</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {budgets.map((budget) => {
                const { spent, percentage, status } = calculatePercentageUsed(budget)
                return (
                  <Card key={budget.id} className={`border-l-4 ${
                    status === 'danger' ? 'border-l-red-500' : 
                    status === 'warning' ? 'border-l-yellow-500' : 
                    'border-l-green-500'
                  }`}>
                    <CardHeader>
                      <CardTitle className="flex justify-between">
                        <span>{budget.category}</span>
                        <span className="text-gray-500">
                          ${spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Progress value={percentage} className="h-2" />
                      <div className="mt-2 text-sm text-gray-600">
                        {percentage.toFixed(0)}% of budget used
                      </div>
                      {status === 'danger' && (
                        <div className="text-red-500 text-sm mt-2">
                          Warning: You&apos;ve exceeded 90% of your budget!
                        </div>
                      )}
                      <div className="mt-4 flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEditModal(budget)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteBudget(budget.id)}>
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="monthly">
            <div className="mb-4">
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>
                      {new Date(0, i).toLocaleString('default', { month: 'long' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-6">
              {getMonthlyStats().map(stat => (
                <Card key={stat.id}>
                  <CardHeader>
                    <CardTitle>{stat.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Spent: ${stat.spent.toFixed(2)}</span>
                      <span className={stat.remaining < 0 ? 'text-red-500' : 'text-green-500'}>
                        Remaining: ${stat.remaining.toFixed(2)}
                      </span>
                    </div>
                    <Progress value={(stat.spent / stat.amount) * 100} />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBudget ? 'Edit Budget Category' : 'Add New Budget Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddOrUpdateBudget} className="space-y-4">
            <div>
              <Label htmlFor="category">Category</Label>
              {editingBudget ? (
                <Input
                  id="category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  required
                />
              ) : (
                <Select value={newCategory} onValueChange={setNewCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                required
              />
            </div>
            <Button type="submit">{editingBudget ? 'Update' : 'Add'} Budget</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}