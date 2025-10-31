import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const result = await sql`
    SELECT id, name
    FROM card_users
    WHERE card_id = ${id}
    ORDER BY name
  `

  return NextResponse.json(result)
}
