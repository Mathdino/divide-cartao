import { getSession } from "@/lib/session"
import { getCardsByUser, formatMonthYear } from "@/lib/cards"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MobileNav } from "@/components/mobile-nav"
import { Plus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function CardsPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const cards = await getCardsByUser(session.userId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Meus Cartões</h1>
            <p className="text-muted-foreground">Gerencie todos os seus cartões</p>
          </div>
          <Link href="/cards/new">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo
            </Button>
          </Link>
        </div>

        {/* Cards List */}
        {cards.length > 0 ? (
          <div className="space-y-3">
            {cards.map((card) => (
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
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground mb-4">Nenhum cartão cadastrado</p>
              <Link href="/cards/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar primeiro cartão
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      <MobileNav />
    </div>
  )
}
