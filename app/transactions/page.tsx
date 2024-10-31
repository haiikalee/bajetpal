'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sidebar } from '../components/Sidebar'
import AddTransactionModal from '../components/AddTransactionModal'
import { Edit, Trash } from 'lucide-react'

interface Transaction {
  id: number
  description: string
  amount: number
  date: string
  category: string
  type: 'income' | 'expense'
  userId?: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin')
    }
  }, [status, router])

  useEffect(() => {
    fetchTransactions()
  }, [])

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
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

  const handleAddTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      if (!session?.user?.id) {
        console.error('No user ID found in session')
        return
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...transaction,
          userId: session.user.id
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error response:', errorData)
        return
      }
      
      fetchTransactions()
    } catch (error) {
      console.error('Error adding transaction:', error)
    }
  }

  const handleEditTransaction = async (transaction: Transaction) => {
    try {
      const response = await fetch(`/api/transactions/${transaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      })
      if (response.ok) {
        fetchTransactions()
        setEditingTransaction(null)
      }
    } catch (error) {
      console.error('Error editing transaction:', error)
    }
  }

  const handleDeleteTransaction = async (id: number) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        fetchTransactions()
      }
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Transactions</h2>
              <Button onClick={() => setIsModalOpen(true)}>
                Add Transaction
              </Button>
            </div>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <Card key={transaction.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between">
                      <span>{transaction.description}</span>
                      <span className={transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                        ${Math.abs(transaction.amount).toFixed(2)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Date: {new Date(transaction.date).toLocaleDateString()}</p>
                    <p>Category: {transaction.category}</p>
                    <div className="mt-4 flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingTransaction(transaction)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteTransaction(transaction.id)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <AddTransactionModal
        isOpen={isModalOpen || !!editingTransaction}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTransaction(null)
        }}
        onAddTransaction={handleAddTransaction}
        onEditTransaction={handleEditTransaction}
        onDeleteTransaction={handleDeleteTransaction}
        transaction={editingTransaction}
      />
    </div>
  )
}