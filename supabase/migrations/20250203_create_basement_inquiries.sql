-- Create basement_inquiries table
CREATE TABLE basement_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Project Details
  project_types TEXT[] NOT NULL,
  needs_separate_entrance BOOLEAN NOT NULL,
  has_plan_design BOOLEAN NOT NULL,
  project_urgency TEXT NOT NULL CHECK (project_urgency IN ('ASAP', '1-3 months')),
  additional_details TEXT,

  -- Location & Contact
  project_location TEXT NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,

  -- Status Tracking
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'contacted', 'converted', 'rejected')),
  notes TEXT,

  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Create indexes for basement_inquiries table
CREATE INDEX idx_basement_inquiries_email ON basement_inquiries(email);
CREATE INDEX idx_basement_inquiries_created_at ON basement_inquiries(created_at DESC);
CREATE INDEX idx_basement_inquiries_status ON basement_inquiries(status);
CREATE INDEX idx_basement_inquiries_project_urgency ON basement_inquiries(project_urgency);

-- Enable Row Level Security
ALTER TABLE basement_inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for basement_inquiries table
CREATE POLICY "Allow anonymous basement submissions" ON basement_inquiries
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated basement inserts" ON basement_inquiries
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated basement select" ON basement_inquiries
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated basement update" ON basement_inquiries
  FOR UPDATE TO authenticated
  USING (true);

-- Create trigger for basement_inquiries table (reuse existing function)
CREATE TRIGGER update_basement_inquiries_updated_at
BEFORE UPDATE ON basement_inquiries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

