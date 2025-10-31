"use client"

import { deleteExpense } from "@/app/actions/expenses"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useState } from "react"

export function DeleteExpenseButton({ expenseId, cardId }: { expenseId: string; cardId: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este gasto?")) {
      return
    }

    setIsDeleting(true)
    await deleteExpense(expenseId, cardId)
  }

  return (
    <Button variant="ghost" size="icon" onClick={handleDelete} disabled={isDeleting}>
      <Trash2 className="h-4 w-4 text-destructive" />
    </Button>
  )
}
