import { neon } from "@neondatabase/serverless";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
import { config } from "dotenv";
config({ path: path.resolve(process.cwd(), ".env") });

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // Read the SQL file
    const sqlFilePath = path.resolve(process.cwd(), "scripts", "001-create-tables.sql");
    const sqlContent = fs.readFileSync(sqlFilePath, "utf-8");
    
    console.log("Running migrations...");
    
    // First, create all tables without foreign key constraints
    console.log("Creating tables without foreign key constraints...");
    await sql.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await sql.query(`
      CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        nickname TEXT NOT NULL,
        user_id TEXT NOT NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await sql.query(`
      CREATE TABLE IF NOT EXISTS card_users (
        id TEXT PRIMARY KEY,
        card_id TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await sql.query(`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        card_id TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT NOT NULL,
        location TEXT NOT NULL,
        date TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await sql.query(`
      CREATE TABLE IF NOT EXISTS expense_users (
        id TEXT PRIMARY KEY,
        expense_id TEXT NOT NULL,
        card_user_id TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL
      );
    `);
    
    // Then add foreign key constraints
    console.log("Adding foreign key constraints...");
    await sql.query(`ALTER TABLE cards ADD CONSTRAINT fk_cards_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;`);
    await sql.query(`ALTER TABLE card_users ADD CONSTRAINT fk_card_users_card_id FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE;`);
    await sql.query(`ALTER TABLE expenses ADD CONSTRAINT fk_expenses_card_id FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE;`);
    await sql.query(`ALTER TABLE expense_users ADD CONSTRAINT fk_expense_users_expense_id FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE;`);
    await sql.query(`ALTER TABLE expense_users ADD CONSTRAINT fk_expense_users_card_user_id FOREIGN KEY (card_user_id) REFERENCES card_users(id) ON DELETE CASCADE;`);
    
    // Finally, create indexes
    console.log("Creating indexes...");
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_cards_month_year ON cards(month, year);`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_card_users_card_id ON card_users(card_id);`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_expenses_card_id ON expenses(card_id);`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_expense_users_expense_id ON expense_users(expense_id);`);
    await sql.query(`CREATE INDEX IF NOT EXISTS idx_expense_users_card_user_id ON expense_users(card_user_id);`);
    
    console.log("Migrations completed successfully!");
  } catch (error) {
    console.error("Error running migrations:", error);
    process.exit(1);
  }
}

runMigrations();