"use client"

import { useState } from "react"
import { changePassword } from "@/app/actions/settings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ChangePasswordForm() {
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setError("")
    setSuccess(false)

    const result = await changePassword(formData)

    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(true)
      // Reset form
      const form = document.getElementById("change-password-form") as HTMLFormElement
      form?.reset()
    }
  }

  return (
    <form id="change-password-form" action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Senha Atual</Label>
        <Input id="currentPassword" name="currentPassword" type="password" placeholder="••••••••" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">Nova Senha</Label>
        <Input id="newPassword" name="newPassword" type="password" placeholder="••••••••" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" required />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {success && <p className="text-sm text-green-600">Senha alterada com sucesso!</p>}

      <Button type="submit" className="w-full">
        Alterar Senha
      </Button>
    </form>
  )
}
