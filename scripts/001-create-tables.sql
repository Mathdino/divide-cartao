-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create cards table
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  user_id TEXT NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create card_users table (pagantes do cartão)
CREATE TABLE IF NOT EXISTS card_users (
  id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL,
  name TEXT NOT NULL,
  in_split BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  card_id TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

-- Create expense_users table (divisão de gastos)
CREATE TABLE IF NOT EXISTS expense_users (
  id TEXT PRIMARY KEY,
  expense_id TEXT NOT NULL,
  card_user_id TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
  FOREIGN KEY (card_user_id) REFERENCES card_users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards(user_id);
CREATE INDEX IF NOT EXISTS idx_cards_month_year ON cards(month, year);
CREATE INDEX IF NOT EXISTS idx_card_users_card_id ON card_users(card_id);
CREATE INDEX IF NOT EXISTS idx_expenses_card_id ON expenses(card_id);
CREATE INDEX IF NOT EXISTS idx_expense_users_expense_id ON expense_users(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_users_card_user_id ON expense_users(card_user_id);
