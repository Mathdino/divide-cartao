"use client"

import { signOut } from "@/app/actions/auth"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function SignOutButton() {
  const handleSignOut = async () => {
    if (confirm("Tem certeza que deseja sair?")) {
      await signOut()
    }
  }

  return (
    <Button variant="destructive" className="w-full" onClick={handleSignOut}>
      <LogOut className="h-4 w-4 mr-2" />
      Sair da Conta
    </Button>
  )
}
