import { getSession } from "@/lib/session"
import { getCardById, formatMonthYear } from "@/lib/cards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { DeleteExpenseButton } from "@/components/delete-expense-button"
import { ShareButton } from "@/components/share-button"

export default async function CardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const card = await getCardById(id)

  if (!card) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 pt-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">{card.nickname}</h1>
            <p className="text-muted-foreground text-sm">{formatMonthYear(card.month, card.year)}</p>
          </div>
          <ShareButton cardId={card.id} />
        </div>

        {/* Total Card */}
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0">
          <CardContent className="pt-6">
            <p className="text-blue-100 text-sm">Total do cartão</p>
            <p className="text-4xl font-bold mt-2">R$ {card.total.toFixed(2)}</p>
          </CardContent>
        </Card>

        {/* Card Users Totals */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total por Pagante</CardTitle>
          </CardHeader>
          <CardContent>
            {card.cardUsers.length > 0 ? (
              <div className="space-y-3">
                {card.cardUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">{user.name}</span>
                    <span className="font-semibold text-primary">R$ {user.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Nenhum pagante cadastrado</p>
            )}
          </CardContent>
        </Card>

        {/* Expenses */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Gastos</h2>
            <Link href={`/cards/${card.id}/expenses/new`}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </Link>
          </div>

          {card.expenses.length > 0 ? (
            <div className="space-y-3">
              {card.expenses.map((expense) => (
                <Card key={expense.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">{expense.location}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(expense.date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground whitespace-nowrap">
                          R$ {expense.amount.toFixed(2)}
                        </p>
                        <DeleteExpenseButton expenseId={expense.id} cardId={card.id} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">Nenhum gasto cadastrado</p>
                <Link href={`/cards/${card.id}/expenses/new`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar primeiro gasto
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
