export interface User {
  id: string
  email: string
  name?: string
}

export interface Transaction {
  id: number
  description: string
  amount: number
  date: string
  category: string
  type: 'income' | 'expense'
  userId: string
}

export interface Budget {
  id: number
  category: string
  amount: number
  userId: string
}

// Add shared categories
export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investments', 'Other Income'] as const
export const EXPENSE_CATEGORIES = ['Food', 'Transportation', 'Entertainment', 'Bills', 'Shopping', 'Others'] as const

export type IncomeCategory = typeof INCOME_CATEGORIES[number]
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number] 