/*
  # Create Purchases Schema

  1. New Tables
    - `purchases`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `wallet_id` (uuid, references wallets)
      - `credits` (numeric)
      - `price_per_credit` (numeric)
      - `inr_amount` (numeric)
      - `wallet_hash` (text)
      - `status` (text, enum: completed, pending)
      - `created_at` (timestamptz)
    
  2. Security
    - Enable RLS on `purchases` table
    - Users can only read and create their own purchases
*/

-- Create enum type
CREATE TYPE purchase_status AS ENUM ('completed', 'pending');

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_id uuid NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
  credits numeric NOT NULL CHECK (credits > 0),
  price_per_credit numeric NOT NULL CHECK (price_per_credit > 0),
  inr_amount numeric NOT NULL CHECK (inr_amount > 0),
  wallet_hash text NOT NULL,
  status purchase_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Policies for purchases
CREATE POLICY "Users can read own purchases"
  ON purchases
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own purchases"
  ON purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_wallet_id ON purchases(wallet_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status);
