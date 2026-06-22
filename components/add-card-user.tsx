"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { addCardUser } from "@/app/actions/cards"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { UserPlus } from "lucide-react"

export function AddCardUser({ cardId }: { cardId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [inSplit, setInSplit] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    setError("")
    if (name.trim() === "") {
      setError("Informe o nome")
      return
    }
    const fd = new FormData()
    fd.append("cardId", cardId)
    fd.append("name", name.trim())
    fd.append("inSplit", String(inSplit))

    setSaving(true)
    const res = await addCardUser(fd)
    setSaving(false)

    if (res?.error) {
      setError(res.error)
      return
    }
    setName("")
    setInSplit(true)
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" className="w-full" onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4 mr-2" />
        Adicionar pagante
      </Button>
    )
  }

  return (
    <div className="space-y-3 p-3 rounded-lg border bg-muted">
      <Input placeholder="Nome do pagante" value={name} onChange={(e) => setName(e.target.value)} />
      <div className="flex items-center justify-between">
        <Label className="text-sm text-muted-foreground">Entra na divisão</Label>
        <Switch checked={inSplit} onCheckedChange={setInSplit} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" className="flex-1" onClick={handleAdd} disabled={saving}>
          {saving ? "Salvando..." : "Salvar"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setOpen(false); setError("") }}>
          Cancelar
        </Button>
      </div>
    </div>
  )
}
