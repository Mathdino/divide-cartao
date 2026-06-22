import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import * as path from "path";
import { config } from "dotenv";

config({ path: path.resolve(process.cwd(), ".env") });

// Edit these to change the seeded login.
const EMAIL = "matheus@divide.app";
const PASSWORD = "divide123";
const NAME = "Matheus";

async function seed() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }
  const sql = neon(process.env.DATABASE_URL);

  const hashed = await bcrypt.hash(PASSWORD, 10);

  const existing = await sql`SELECT id FROM users WHERE email = ${EMAIL} LIMIT 1`;

  if (existing.length > 0) {
    await sql`UPDATE users SET password = ${hashed}, name = ${NAME} WHERE email = ${EMAIL}`;
    console.log(`Updated existing user: ${EMAIL}`);
  } else {
    const id = randomUUID();
    await sql`
      INSERT INTO users (id, email, password, name, created_at)
      VALUES (${id}, ${EMAIL}, ${hashed}, ${NAME}, NOW())
    `;
    console.log(`Created user: ${EMAIL}`);
  }

  console.log("---");
  console.log("LOGIN:", EMAIL);
  console.log("SENHA:", PASSWORD);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
