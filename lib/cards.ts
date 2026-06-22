import { sql } from "./db"

export interface Card {
  id: string
  nickname: string
  userId: string
  month: number
  year: number
  createdAt: Date
  total: number
}

export interface CardWithDetails extends Card {
  cardUsers: Array<{
    id: string
    name: string
    total: number
    inSplit: boolean
  }>
  expenses: Array<{
    id: string
    amount: number
    description: string
    location: string
    date: Date
  }>
}

export async function getCardsByUser(userId: string): Promise<Card[]> {
  const result = await sql`
    SELECT 
      c.id,
      c.nickname,
      c.user_id,
      c.month,
      c.year,
      c.created_at,
      COALESCE(SUM(e.amount), 0) as total
    FROM cards c
    LEFT JOIN expenses e ON c.id = e.card_id
    WHERE c.user_id = ${userId}
    GROUP BY c.id, c.nickname, c.user_id, c.month, c.year, c.created_at
    ORDER BY c.year DESC, c.month DESC
  `

  return result.map((row: any) => ({
    id: row.id,
    nickname: row.nickname,
    userId: row.user_id,
    month: row.month,
    year: row.year,
    createdAt: new Date(row.created_at),
    total: Number.parseFloat(row.total),
  }))
}

export async function getCardById(cardId: string): Promise<CardWithDetails | null> {
  const cardResult = await sql`
    SELECT 
      c.id,
      c.nickname,
      c.user_id,
      c.month,
      c.year,
      c.created_at,
      COALESCE(SUM(e.amount), 0) as total
    FROM cards c
    LEFT JOIN expenses e ON c.id = e.card_id
    WHERE c.id = ${cardId}
    GROUP BY c.id, c.nickname, c.user_id, c.month, c.year, c.created_at
  `

  if (cardResult.length === 0) return null

  const card = cardResult[0]

  const cardUsersResult = await sql`
    SELECT
      cu.id,
      cu.name,
      cu.in_split,
      COALESCE(SUM(eu.amount), 0) as total
    FROM card_users cu
    LEFT JOIN expense_users eu ON cu.id = eu.card_user_id
    WHERE cu.card_id = ${cardId}
    GROUP BY cu.id, cu.name, cu.in_split
    ORDER BY cu.name
  `

  const expensesResult = await sql`
    SELECT id, amount, description, location, date
    FROM expenses
    WHERE card_id = ${cardId}
    ORDER BY date DESC
  `

  return {
    id: card.id,
    nickname: card.nickname,
    userId: card.user_id,
    month: card.month,
    year: card.year,
    createdAt: new Date(card.created_at),
    total: Number.parseFloat(card.total),
    cardUsers: cardUsersResult.map((row: any) => ({
      id: row.id,
      name: row.name,
      total: Number.parseFloat(row.total),
      inSplit: row.in_split,
    })),
    expenses: expensesResult.map((row: any) => ({
      id: row.id,
      amount: Number.parseFloat(row.amount),
      description: row.description,
      location: row.location,
      date: new Date(row.date),
    })),
  }
}

export function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date()
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  }
}

export function formatMonthYear(month: number, year: number): string {
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ]
  return `${months[month - 1]} ${year}`
}
