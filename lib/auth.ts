import { sql } from "./db"
import bcrypt from "bcryptjs"

export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(email: string, password: string, name: string): Promise<User> {
  const hashedPassword = await hashPassword(password)
  const id = crypto.randomUUID()

  await sql`
    INSERT INTO users (id, email, password, name, created_at)
    VALUES (${id}, ${email}, ${hashedPassword}, ${name}, NOW())
  `

  return {
    id,
    email,
    name,
    createdAt: new Date(),
  }
}

export async function getUserByEmail(email: string): Promise<(User & { password: string }) | null> {
  const result = await sql`
    SELECT id, email, password, name, created_at
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `

  if (result.length === 0) return null

  return {
    id: result[0].id,
    email: result[0].email,
    password: result[0].password,
    name: result[0].name,
    createdAt: new Date(result[0].created_at),
  }
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await sql`
    SELECT id, email, name, created_at
    FROM users
    WHERE id = ${id}
    LIMIT 1
  `

  if (result.length === 0) return null

  return {
    id: result[0].id,
    email: result[0].email,
    name: result[0].name,
    createdAt: new Date(result[0].created_at),
  }
}
