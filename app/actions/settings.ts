"use server"

import { sql } from "@/lib/db"
import { getSession } from "@/lib/session"
import { hashPassword, verifyPassword } from "@/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual é obrigatória"),
    newPassword: z.string().min(6, "Nova senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

export async function changePassword(formData: FormData) {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }

  const validatedFields = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0].message,
    }
  }

  const { currentPassword, newPassword } = validatedFields.data

  const userResult = await sql`
    SELECT password FROM users WHERE id = ${session.userId}
  `

  if (userResult.length === 0) {
    return { error: "Usuário não encontrado" }
  }

  const isValidPassword = await verifyPassword(currentPassword, userResult[0].password)
  if (!isValidPassword) {
    return { error: "Senha atual incorreta" }
  }

  const hashedPassword = await hashPassword(newPassword)

  await sql`
    UPDATE users
    SET password = ${hashedPassword}
    WHERE id = ${session.userId}
  `

  revalidatePath("/settings")
  return { success: true }
}
