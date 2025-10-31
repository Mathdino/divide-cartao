"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createExpenseSchema = z.object({
  cardId: z.string(),
  amount: z.number().positive("Valor deve ser positivo"),
  description: z.string().min(1, "Descrição é obrigatória"),
  location: z.string().min(1, "Local é obrigatório"),
  date: z.string(),
  selectedUsers: z.array(z.string()).min(1, "Selecione pelo menos um pagante"),
  splitType: z.enum(["equal", "custom"]),
})

export async function createExpense(formData: FormData) {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  const selectedUsersRaw = formData.get("selectedUsers")
  const selectedUsers = selectedUsersRaw ? JSON.parse(selectedUsersRaw as string) : []

  const validatedFields = createExpenseSchema.safeParse({
    cardId: formData.get("cardId"),
    amount: Number.parseFloat(formData.get("amount") as string),
    description: formData.get("description"),
    location: formData.get("location"),
    date: formData.get("date"),
    selectedUsers,
    splitType: formData.get("splitType"),
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0].message,
    }
  }

  const { cardId, amount, description, location, date, selectedUsers: users, splitType } = validatedFields.data

  const expenseId = crypto.randomUUID()

  await sql`
    INSERT INTO expenses (id, card_id, amount, description, location, date, created_at)
    VALUES (${expenseId}, ${cardId}, ${amount}, ${description}, ${location}, ${date}, NOW())
  `

  if (splitType === "equal") {
    const amountPerUser = amount / users.length

    for (const userId of users) {
      const expenseUserId = crypto.randomUUID()
      await sql`
        INSERT INTO expense_users (id, expense_id, card_user_id, amount)
        VALUES (${expenseUserId}, ${expenseId}, ${userId}, ${amountPerUser})
      `
    }
  } else {
    for (const userId of users) {
      const expenseUserId = crypto.randomUUID()
      await sql`
        INSERT INTO expense_users (id, expense_id, card_user_id, amount)
        VALUES (${expenseUserId}, ${expenseId}, ${userId}, ${amount})
      `
    }
  }

  revalidatePath(`/cards/${cardId}`)
  return { success: true }
}

export async function deleteExpense(expenseId: string, cardId: string) {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  await sql`
    DELETE FROM expenses
    WHERE id = ${expenseId}
  `

  revalidatePath(`/cards/${cardId}`)
  return { success: true }
}
