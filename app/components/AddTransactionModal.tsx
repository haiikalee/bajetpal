import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface Transaction {
  id: number
  description: string
  amount: number
  date: string
  category: string
  type: 'income' | 'expense'
}

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>
  onEditTransaction: (transaction: Transaction) => Promise<void>
  onDeleteTransaction: (id: number) => Promise<void>
  transaction: Transaction | null
}

const incomeCategories = ['Salary', 'Freelance', 'Investments', 'Other Income']
const expenseCategories = ['Food', 'Transportation', 'Utilities', 'Entertainment', 'Other Expenses']

export default function AddTransactionModal({ 
  isOpen, 
  onClose, 
  onAddTransaction, 
  onEditTransaction, 
  onDeleteTransaction,
  transaction,
}: AddTransactionModalProps) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('')
  const [type, setType] = useState<'income' | 'expense'>('expense')

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description)
      setAmount(Math.abs(transaction.amount).toString())
      // Format the date to YYYY-MM-DD
      setDate(new Date(transaction.date).toISOString().split('T')[0])
      setCategory(transaction.category)
      setType(transaction.type)
    } else {
      resetForm()
    }
  }, [transaction])

  const resetForm = () => {
    setDescription('')
    setAmount('')
    // Set today's date as default
    setDate(new Date().toISOString().split('T')[0])
    setCategory('')
    setType('expense')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const transactionData = {
      description,
      amount: type === 'income' ? parseFloat(amount) : -parseFloat(amount),
      date,
      category,
      type
    }
    if (transaction?.id) {
      onEditTransaction({ ...transactionData, id: transaction.id })
    } else {
      onAddTransaction(transactionData)
    }
    resetForm()
    onClose()
  }

  const handleDelete = () => {
    if (transaction?.id) {
      onDeleteTransaction(transaction.id)
      onClose()
    }
  }

  const availableCategories = type === 'income' 
    ? incomeCategories 
    : expenseCategories

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{transaction ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Type</Label>
            <RadioGroup value={type} onValueChange={(value: 'income' | 'expense') => setType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="income" />
                <Label htmlFor="income">Income</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="expense" />
                <Label htmlFor="expense">Expense</Label>
              </div>
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={category}
              onValueChange={setCategory}
              required
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between">
            <Button type="submit">{transaction ? 'Update' : 'Add'} Transaction</Button>
            {transaction && (
              <Button type="button" variant="destructive" onClick={handleDelete}>Delete</Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}