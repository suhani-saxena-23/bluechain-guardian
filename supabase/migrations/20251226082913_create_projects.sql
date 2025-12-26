/*
  # Create Projects Schema

  1. New Tables
    - `projects`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `hectares` (numeric)
      - `latitude` (numeric)
      - `longitude` (numeric)
      - `address` (text)
      - `photo_urls` (text array)
      - `video_url` (text)
      - `status` (text, enum: submitted, under-review, verified, rejected)
      - `co2_tons` (numeric)
      - `validator_id` (uuid, references profiles)
      - `validator_notes` (text)
      - `verified_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
  2. Security
    - Enable RLS on `projects` table
    - Generators can create and read their own projects
    - Validators can read all under-review projects
    - Consumers can read all verified projects
    - Validators can update projects under review
*/

-- Create enum type
CREATE TYPE project_status AS ENUM ('submitted', 'under-review', 'verified', 'rejected');

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  hectares numeric NOT NULL CHECK (hectares > 0),
  latitude numeric NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude numeric NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  address text,
  photo_urls text[] DEFAULT '{}',
  video_url text,
  status project_status DEFAULT 'submitted',
  co2_tons numeric,
  validator_id uuid REFERENCES profiles(id),
  validator_notes text,
  verified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policies for projects
CREATE POLICY "Generators can create projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'generator')
  );

CREATE POLICY "Users can read own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Validators can read under-review and verified projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'validator') AND
    status IN ('under-review', 'verified', 'rejected')
  );

CREATE POLICY "Consumers can read verified projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'consumer') AND
    status = 'verified'
  );

CREATE POLICY "Validators can update under-review projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'validator') AND
    status IN ('submitted', 'under-review')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'validator')
  );

-- Create trigger for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_validator_id ON projects(validator_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
