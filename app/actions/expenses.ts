"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { splitAmount } from "@/lib/split"

// Novo gasto: somente Local + Preço + (DIVIDIR entre todos | atribuir a 1 pagante)
const createExpenseSchema = z
  .object({
    cardId: z.string().min(1),
    amount: z.number().positive("Valor deve ser positivo"),
    location: z.string().min(1, "Local é obrigatório"),
    mode: z.enum(["split", "single"]),
    cardUserId: z.string().optional(),
  })
  .refine((d) => d.mode !== "single" || (d.cardUserId && d.cardUserId.length > 0), {
    message: "Selecione o pagante",
    path: ["cardUserId"],
  })

export async function createExpense(formData: FormData) {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  const validatedFields = createExpenseSchema.safeParse({
    cardId: formData.get("cardId"),
    amount: Number.parseFloat(formData.get("amount") as string),
    location: formData.get("location"),
    mode: formData.get("mode"),
    cardUserId: (formData.get("cardUserId") as string) || undefined,
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0].message,
    }
  }

  const { cardId, amount, location, mode, cardUserId } = validatedFields.data

  const expenseId = crypto.randomUUID()

  // description é NOT NULL no banco — usamos o local como descrição.
  await sql`
    INSERT INTO expenses (id, card_id, amount, description, location, date, created_at)
    VALUES (${expenseId}, ${cardId}, ${amount}, ${location}, ${location}, NOW(), NOW())
  `

  if (mode === "single") {
    // Atribui o valor total a um único pagante.
    const expenseUserId = crypto.randomUUID()
    await sql`
      INSERT INTO expense_users (id, expense_id, card_user_id, amount)
      VALUES (${expenseUserId}, ${expenseId}, ${cardUserId}, ${amount})
    `
  } else {
    // DIVIDIR igualmente entre os pagantes que ENTRAM na divisão (in_split = true).
    const cardUsers = await sql`
      SELECT id FROM card_users WHERE card_id = ${cardId} AND in_split = true ORDER BY name
    `

    if (cardUsers.length === 0) {
      // Nenhum pagante na divisão: remove o gasto recém-criado e avisa.
      await sql`DELETE FROM expenses WHERE id = ${expenseId}`
      return { error: "Cadastre pelo menos um pagante que entre na divisão" }
    }

    const shares = splitAmount(amount, cardUsers.length)

    for (let i = 0; i < cardUsers.length; i++) {
      const expenseUserId = crypto.randomUUID()
      await sql`
        INSERT INTO expense_users (id, expense_id, card_user_id, amount)
        VALUES (${expenseUserId}, ${expenseId}, ${cardUsers[i].id}, ${shares[i]})
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
