"use client"

import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"

export function PrintPdfButton({ className }: { className?: string }) {
  return (
    <Button onClick={() => window.print()} className={className}>
      <FileDown className="h-4 w-4 mr-2" />
      Baixar / Enviar PDF
    </Button>
  )
}
