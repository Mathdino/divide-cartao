"use client"

import { use, useState, useEffect } from "react"
import { createExpense } from "@/app/actions/expenses"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MobileNav } from "@/components/mobile-nav"
import { ArrowLeft, Users, User } from "lucide-react"
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
  const [mode, setMode] = useState<"split" | "single">("split")
  const [singleUserId, setSingleUserId] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchCardUsers() {
      try {
        const response = await fetch(`/api/cards/${cardId}/users`)
        const data = await response.json()
        setCardUsers(data)
        if (data.length > 0) setSingleUserId(data[0].id)
        setLoading(false)
      } catch (err) {
        setError("Erro ao carregar pagantes")
        setLoading(false)
      }
    }
    fetchCardUsers()
  }, [cardId])

  const handleSubmit = async (formData: FormData) => {
    setError("")

    if (mode === "single" && !singleUserId) {
      setError("Selecione o pagante")
      return
    }

    formData.append("cardId", cardId)
    formData.append("mode", mode)
    if (mode === "single") {
      formData.append("cardUserId", singleUserId)
    }

    setSubmitting(true)
    const result = await createExpense(formData)
    if (result?.error) {
      setError(result.error)
      setSubmitting(false)
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
            <p className="text-muted-foreground text-sm">Local, preço e como dividir</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Informações do Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="location">Local</Label>
                <Input id="location" name="location" type="text" placeholder="Ex: Supermercado XYZ" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Preço (R$)</Label>
                <Input id="amount" name="amount" type="number" step="0.01" min="0.01" placeholder="0,00" required />
              </div>

              <div className="space-y-3">
                <Label>Como lançar</Label>
                <RadioGroup value={mode} onValueChange={(value) => setMode(value as "split" | "single")}>
                  <label
                    htmlFor="mode-split"
                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <RadioGroupItem value="split" id="mode-split" />
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">DIVIDIR entre todos</span>
                  </label>
                  <label
                    htmlFor="mode-single"
                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <RadioGroupItem value="single" id="mode-single" />
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Atribuir a um pagante</span>
                  </label>
                </RadioGroup>
              </div>

              {mode === "single" && (
                <div className="space-y-3">
                  <Label>Pagante</Label>
                  <div className="space-y-2">
                    {cardUsers.map((user) => (
                      <label
                        key={user.id}
                        htmlFor={`u-${user.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-muted cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                      >
                        <input
                          type="radio"
                          id={`u-${user.id}`}
                          name="singleUser"
                          className="accent-primary"
                          checked={singleUserId === user.id}
                          onChange={() => setSingleUserId(user.id)}
                        />
                        <span className="font-normal">{user.name}</span>
                      </label>
                    ))}
                    {cardUsers.length === 0 && (
                      <p className="text-sm text-muted-foreground">Nenhum pagante cadastrado neste cartão.</p>
                    )}
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Salvando..." : "Adicionar Gasto"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </div>
  )
}
