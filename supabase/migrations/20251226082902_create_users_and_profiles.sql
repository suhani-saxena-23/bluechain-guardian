/*
  # Create Users and Profiles Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `role` (text, enum: generator, validator, consumer)
      - `organization_name` (text)
      - `registration_number` (text)
      - `email` (text)
      - `verification_status` (text, enum: pending, verified, rejected)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
  2. Security
    - Enable RLS on `profiles` table
    - Add policies for users to read their own profile
    - Add policies for users to update their own profile
    - Add policies for authenticated users to read verified profiles
*/

-- Create enum types
CREATE TYPE user_role AS ENUM ('generator', 'validator', 'consumer');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  organization_name text NOT NULL,
  registration_number text NOT NULL,
  email text NOT NULL,
  verification_status verification_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can read verified profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (verification_status = 'verified');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_verification_status ON profiles(verification_status);
