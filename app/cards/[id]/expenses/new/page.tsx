"use client"

import { use, useState, useEffect } from "react"
import { createExpense } from "@/app/actions/expenses"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MobileNav } from "@/components/mobile-nav"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface CardUser {
  id: string
  name: string
}

export default function NewExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: cardId } = use(params)
  const router = useRouter()
  const [cardUsers, setCardUsers] = useState<CardUser[]>([])
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [splitType, setSplitType] = useState<"equal" | "custom">("equal")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCardUsers() {
      try {
        const response = await fetch(`/api/cards/${cardId}/users`)
        const data = await response.json()
        setCardUsers(data)
        setLoading(false)
      } catch (err) {
        setError("Erro ao carregar pagantes")
        setLoading(false)
      }
    }
    fetchCardUsers()
  }, [cardId])

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const selectAll = () => {
    setSelectedUsers(cardUsers.map((u) => u.id))
  }

  const handleSubmit = async (formData: FormData) => {
    if (selectedUsers.length === 0) {
      setError("Selecione pelo menos um pagante")
      return
    }

    formData.append("cardId", cardId)
    formData.append("selectedUsers", JSON.stringify(selectedUsers))
    formData.append("splitType", splitType)

    const result = await createExpense(formData)
    if (result?.error) {
      setError(result.error)
    } else {
      router.push(`/cards/${cardId}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 pt-4">
          <Link href={`/cards/${cardId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Novo Gasto</h1>
            <p className="text-muted-foreground text-sm">Adicione um gasto ao cartão</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input id="description" name="description" type="text" placeholder="Ex: Compras do mercado" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Local</Label>
                <Input id="location" name="location" type="text" placeholder="Ex: Supermercado XYZ" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Data</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Tipo de Divisão</Label>
                </div>
                <RadioGroup value={splitType} onValueChange={(value) => setSplitType(value as "equal" | "custom")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="equal" id="equal" />
                    <Label htmlFor="equal" className="font-normal cursor-pointer">
                      Dividir igualmente entre selecionados
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom" />
                    <Label htmlFor="custom" className="font-normal cursor-pointer">
                      Valor total para cada selecionado
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Pagantes</Label>
                  <Button type="button" variant="outline" size="sm" onClick={selectAll}>
                    Selecionar todos
                  </Button>
                </div>

                <div className="space-y-3">
                  {cardUsers.map((user) => (
                    <div key={user.id} className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                      <Checkbox
                        id={user.id}
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => toggleUser(user.id)}
                      />
                      <Label htmlFor={user.id} className="flex-1 cursor-pointer font-normal">
                        {user.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full">
                Adicionar Gasto
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </div>
  )
}
