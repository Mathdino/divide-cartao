import { neon } from "@neondatabase/serverless";
import * as path from "path";

// Load environment variables
import { config } from "dotenv";
config({ path: path.resolve(process.cwd(), ".env") });

async function listTables() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // List all tables in the database
    const result = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    console.log("Tables in the database:");
    result.forEach((row: any) => {
      console.log(`- ${row.table_name}`);
    });
  } catch (error) {
    console.error("Error listing tables:", error);
    process.exit(1);
  }
}

listTables();