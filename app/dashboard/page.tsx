import { getSession } from "@/lib/session"
import { getCardsByUser, getCurrentMonthYear, formatMonthYear } from "@/lib/cards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import { Plus, CreditCardIcon } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const cards = await getCardsByUser(session.userId)
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear()

  const currentCard = cards.find((c) => c.month === currentMonth && c.year === currentYear)
  const historicalCards = cards.filter((c) => !(c.month === currentMonth && c.year === currentYear))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="pt-4">
          <h1 className="text-2xl font-bold text-foreground">Olá, {session.name}</h1>
          <p className="text-muted-foreground">Gerencie seus cartões e gastos</p>
        </div>

        {/* Current Month Card */}
        {currentCard ? (
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Mês Atual</p>
                  <CardTitle className="text-2xl">{currentCard.nickname}</CardTitle>
                  <p className="text-blue-100 text-sm mt-1">{formatMonthYear(currentCard.month, currentCard.year)}</p>
                </div>
                <CreditCardIcon className="h-10 w-10 text-blue-200" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-blue-100 text-sm">Total do mês</p>
                <p className="text-3xl font-bold">R$ {currentCard.total.toFixed(2)}</p>
                <Link href={`/cards/${currentCard.id}`}>
                  <Button variant="secondary" className="w-full mt-4">
                    Ver detalhes
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <CreditCardIcon className="h-12 w-12 text-blue-200 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Nenhum cartão este mês</p>
                <p className="text-blue-100 text-sm mb-4">Crie um cartão para começar a gerenciar seus gastos</p>
                <Link href="/cards/new">
                  <Button variant="secondary">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar cartão
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Historical Cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Histórico</h2>
            <Link href="/cards/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo cartão
              </Button>
            </Link>
          </div>

          {historicalCards.length > 0 ? (
            <div className="space-y-3">
              {historicalCards.map((card) => (
                <Link key={card.id} href={`/cards/${card.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{card.nickname}</p>
                          <p className="text-sm text-muted-foreground">{formatMonthYear(card.month, card.year)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">R$ {card.total.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Nenhum histórico ainda</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <MobileNav />
    </div>
  )
}
