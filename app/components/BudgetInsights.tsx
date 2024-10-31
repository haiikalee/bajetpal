import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Budget, Transaction } from "@/app/types"

interface BudgetInsightsProps {
  budgets: Budget[]
  transactions: Transaction[]
}

export function BudgetInsights({ budgets = [], transactions = [] }: BudgetInsightsProps) {
  const getTopOverspentCategories = () => {
    return budgets
      .map(budget => {
        const spent = transactions
          .filter(t => t.category === budget.category && t.amount < 0)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0)
        
        return {
          category: budget.category,
          overspent: spent - budget.amount,
          percentage: (spent / budget.amount) * 100
        }
      })
      .filter(b => b.overspent > 0)
      .sort((a, b) => b.overspent - a.overspent)
      .slice(0, 3)
  }

  const overSpentCategories = getTopOverspentCategories()

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Budget Insights</CardTitle>
      </CardHeader>
      <CardContent>
        {overSpentCategories.length > 0 ? (
          <div className="space-y-4">
            {overSpentCategories.map(category => (
              <Alert key={category.category} variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <span className="font-medium">{category.category}</span> is over budget by{' '}
                  <span className="font-medium">${category.overspent.toFixed(2)}</span>
                  <div className="text-sm mt-1">
                    {category.percentage.toFixed(0)}% of budget used
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            All budgets are within limits. Great job! 👏
          </div>
        )}
      </CardContent>
    </Card>
  )
} 