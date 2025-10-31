import { getCardById, formatMonthYear } from "@/lib/cards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCardIcon, Calendar, Receipt } from "lucide-react"
import { notFound } from "next/navigation"

export default async function ShareCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const card = await getCardById(id)

  if (!card) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto p-4 space-y-6 py-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-primary text-primary-foreground p-4 rounded-full">
              <CreditCardIcon className="h-10 w-10" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">{card.nickname}</h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <p>{formatMonthYear(card.month, card.year)}</p>
          </div>
        </div>

        {/* Total Card */}
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0 shadow-xl">
          <CardContent className="pt-8 pb-8 text-center">
            <p className="text-blue-100 text-sm mb-2">Total do Cartão</p>
            <p className="text-5xl font-bold">R$ {card.total.toFixed(2)}</p>
          </CardContent>
        </Card>

        {/* Card Users Totals */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Total por Pagante
            </CardTitle>
          </CardHeader>
          <CardContent>
            {card.cardUsers.length > 0 ? (
              <div className="space-y-3">
                {card.cardUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100"
                  >
                    <span className="font-semibold text-lg">{user.name}</span>
                    <span className="font-bold text-xl text-primary">R$ {user.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">Nenhum pagante cadastrado</p>
            )}
          </CardContent>
        </Card>

        {/* Expenses List */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Detalhamento de Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            {card.expenses.length > 0 ? (
              <div className="space-y-3">
                {card.expenses.map((expense) => (
                  <div key={expense.id} className="p-4 bg-muted rounded-lg border border-border">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground text-lg">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">{expense.location}</p>
                      </div>
                      <p className="font-bold text-xl text-primary whitespace-nowrap">R$ {expense.amount.toFixed(2)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhum gasto cadastrado</p>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground pt-4">
          <p>Relatório gerado pelo Gestor de Cartões</p>
        </div>
      </div>
    </div>
  )
}
