"use client"

import { Button } from "@/components/ui/button"
import { Share2, Check } from "lucide-react"
import { useState } from "react"

export function ShareButton({ cardId }: { cardId: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/share/${cardId}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Relatório de Gastos",
          text: "Confira o relatório de gastos do cartão",
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled or error occurred
        copyToClipboard(shareUrl)
      }
    } else {
      copyToClipboard(shareUrl)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <Button variant="outline" size="icon" onClick={handleShare}>
      {copied ? <Check className="h-5 w-5 text-green-600" /> : <Share2 className="h-5 w-5" />}
    </Button>
  )
}
