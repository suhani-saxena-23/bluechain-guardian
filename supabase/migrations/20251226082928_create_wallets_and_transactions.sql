/*
  # Create Wallets and Transactions Schema

  1. New Tables
    - `wallets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `address` (text, unique)
      - `balance_inr` (numeric)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `assets`
      - `id` (uuid, primary key)
      - `wallet_id` (uuid, references wallets)
      - `name` (text)
      - `symbol` (text)
      - `balance` (numeric)
      - `inr_value` (numeric)
      - `icon` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `transactions`
      - `id` (uuid, primary key)
      - `wallet_id` (uuid, references wallets)
      - `type` (text, enum: received, sent, swap, buy)
      - `token` (text)
      - `amount` (numeric)
      - `inr_value` (numeric)
      - `from_address` (text)
      - `to_address` (text)
      - `status` (text, enum: completed, pending, failed)
      - `created_at` (timestamptz)
    
  2. Security
    - Enable RLS on all tables
    - Users can only access their own wallet data
*/

-- Create enum types
CREATE TYPE transaction_type AS ENUM ('received', 'sent', 'swap', 'buy');
CREATE TYPE transaction_status AS ENUM ('completed', 'pending', 'failed');

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  address text UNIQUE NOT NULL,
  balance_inr numeric DEFAULT 0 CHECK (balance_inr >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create assets table
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  name text NOT NULL,
  symbol text NOT NULL,
  balance numeric DEFAULT 0 CHECK (balance >= 0),
  inr_value numeric DEFAULT 0 CHECK (inr_value >= 0),
  icon text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(wallet_id, symbol)
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  token text NOT NULL,
  amount numeric NOT NULL,
  inr_value numeric NOT NULL,
  from_address text,
  to_address text,
  status transaction_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies for wallets
CREATE POLICY "Users can read own wallet"
  ON wallets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallet"
  ON wallets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet"
  ON wallets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for assets
CREATE POLICY "Users can read own assets"
  ON assets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM wallets WHERE wallets.id = assets.wallet_id AND wallets.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own assets"
  ON assets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM wallets WHERE wallets.id = wallet_id AND wallets.user_id = auth.uid())
  );

CREATE POLICY "Users can update own assets"
  ON assets
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM wallets WHERE wallets.id = assets.wallet_id AND wallets.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM wallets WHERE wallets.id = wallet_id AND wallets.user_id = auth.uid())
  );

-- Policies for transactions
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM wallets WHERE wallets.id = transactions.wallet_id AND wallets.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM wallets WHERE wallets.id = wallet_id AND wallets.user_id = auth.uid())
  );

-- Create triggers
CREATE TRIGGER update_wallets_updated_at
  BEFORE UPDATE ON wallets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_wallets_address ON wallets(address);
CREATE INDEX IF NOT EXISTS idx_assets_wallet_id ON assets(wallet_id);
CREATE INDEX IF NOT EXISTS idx_assets_symbol ON assets(symbol);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
