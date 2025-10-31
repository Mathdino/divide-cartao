"use server"

import { createUser, getUserByEmail, verifyPassword } from "@/lib/auth"
import { createSession, setSessionCookie, deleteSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { z } from "zod"

const signUpSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
})

const signInSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
})

export async function signUp(formData: FormData) {
  const validatedFields = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0].message,
    }
  }

  const { name, email, password } = validatedFields.data

  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    return {
      error: "Email já cadastrado",
    }
  }

  const user = await createUser(email, password, name)
  const token = await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
  })

  await setSessionCookie(token)
  redirect("/dashboard")
}

export async function signIn(formData: FormData) {
  const validatedFields = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.errors[0].message,
    }
  }

  const { email, password } = validatedFields.data

  const user = await getUserByEmail(email)
  if (!user) {
    return {
      error: "Email ou senha incorretos",
    }
  }

  const isValidPassword = await verifyPassword(password, user.password)
  if (!isValidPassword) {
    return {
      error: "Email ou senha incorretos",
    }
  }

  const token = await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
  })

  await setSessionCookie(token)
  redirect("/dashboard")
}

export async function signOut() {
  await deleteSession()
  redirect("/login")
}
