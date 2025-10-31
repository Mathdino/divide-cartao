"use client"

import { useState } from "react"
import { createCard } from "@/app/actions/cards"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MobileNav } from "@/components/mobile-nav"
import { Plus, X, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewCardPage() {
  const [cardUsers, setCardUsers] = useState<string[]>([""])
  const [error, setError] = useState<string>("")

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const addCardUser = () => {
    setCardUsers([...cardUsers, ""])
  }

  const removeCardUser = (index: number) => {
    setCardUsers(cardUsers.filter((_, i) => i !== index))
  }

  const updateCardUser = (index: number, value: string) => {
    const updated = [...cardUsers]
    updated[index] = value
    setCardUsers(updated)
  }

  const handleSubmit = async (formData: FormData) => {
    const filteredUsers = cardUsers.filter((u) => u.trim() !== "")

    if (filteredUsers.length === 0) {
      setError("Adicione pelo menos um pagante")
      return
    }

    formData.append("cardUsers", JSON.stringify(filteredUsers))

    const result = await createCard(formData)
    if (result?.error) {
      setError(result.error)
    }
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
          <div>
            <h1 className="text-2xl font-bold text-foreground">Novo Cartão</h1>
            <p className="text-muted-foreground text-sm">Crie um cartão para gerenciar gastos</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Cartão</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nickname">Apelido do Cartão</Label>
                <Input id="nickname" name="nickname" type="text" placeholder="Ex: Cartão Principal" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="month">Mês</Label>
                  <Input id="month" name="month" type="number" min="1" max="12" defaultValue={currentMonth} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Ano</Label>
                  <Input id="year" name="year" type="number" min="2020" defaultValue={currentYear} required />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Pagantes</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addCardUser}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>

                <div className="space-y-3">
                  {cardUsers.map((user, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Nome do pagante"
                        value={user}
                        onChange={(e) => updateCardUser(index, e.target.value)}
                      />
                      {cardUsers.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeCardUser(index)}>
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full">
                Criar Cartão
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </div>
  )
}
