"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createCardSchema = z.object({
  nickname: z.string().min(1, "Apelido é obrigatório"),
  month: z.number().min(1).max(12),
  year: z.number().min(2020),
  cardUsers: z.array(z.string().min(1, "Nome do pagante é obrigatório")).min(1, "Adicione pelo menos um pagante"),
})

export async function createCard(formData: FormData) {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  const cardUsersRaw = formData.get("cardUsers")
  const cardUsers = cardUsersRaw ? JSON.parse(cardUsersRaw as string) : []

  const validatedFields = createCardSchema.safeParse({
    nickname: formData.get("nickname"),
    month: Number.parseInt(formData.get("month") as string),
    year: Number.parseInt(formData.get("year") as string),
    cardUsers,
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0].message,
    }
  }

  const { nickname, month, year, cardUsers: users } = validatedFields.data

  const cardId = crypto.randomUUID()

  await sql`
    INSERT INTO cards (id, nickname, user_id, month, year, created_at)
    VALUES (${cardId}, ${nickname}, ${session.userId}, ${month}, ${year}, NOW())
  `

  for (const userName of users) {
    const userId = crypto.randomUUID()
    await sql`
      INSERT INTO card_users (id, card_id, name, created_at)
      VALUES (${userId}, ${cardId}, ${userName}, NOW())
    `
  }

  revalidatePath("/dashboard")
  redirect(`/cards/${cardId}`)
}

export async function deleteCard(cardId: string) {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  await sql`
    DELETE FROM cards
    WHERE id = ${cardId} AND user_id = ${session.userId}
  `

  revalidatePath("/dashboard")
  redirect("/dashboard")
}
