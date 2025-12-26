/*
  # Create Sensor Data Schema

  1. New Tables
    - `sensor_data`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `validator_id` (uuid, references profiles)
      - `temperature` (numeric)
      - `salinity` (numeric)
      - `ph` (numeric)
      - `dissolved_o2` (numeric)
      - `turbidity` (numeric)
      - `recorded_at` (timestamptz)
      - `created_at` (timestamptz)
    
  2. Security
    - Enable RLS on `sensor_data` table
    - Only validators can insert sensor data
    - Validators can read sensor data for projects they're verifying
    - Project owners can read sensor data for their projects
*/

-- Create sensor_data table
CREATE TABLE IF NOT EXISTS sensor_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  validator_id uuid NOT NULL REFERENCES profiles(id),
  temperature numeric,
  salinity numeric,
  ph numeric,
  dissolved_o2 numeric,
  turbidity numeric,
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;

-- Policies for sensor_data
CREATE POLICY "Validators can insert sensor data"
  ON sensor_data
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = validator_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'validator')
  );

CREATE POLICY "Validators can read sensor data for their projects"
  ON sensor_data
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = validator_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'validator')
  );

CREATE POLICY "Project owners can read sensor data for their projects"
  ON sensor_data
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = sensor_data.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sensor_data_project_id ON sensor_data(project_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_validator_id ON sensor_data(validator_id);
CREATE INDEX IF NOT EXISTS idx_sensor_data_recorded_at ON sensor_data(recorded_at DESC);
