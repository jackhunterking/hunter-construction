-- Create quotes table
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Pod Configuration
  use_case TEXT NOT NULL CHECK (use_case IN ('Home Office', 'Home Gym', 'Side Business', 'Other')),
  exterior_color TEXT NOT NULL CHECK (exterior_color IN ('Light', 'Brown', 'Dark')),
  flooring TEXT NOT NULL CHECK (flooring IN ('Carpet', 'Vinyl', 'Concrete')),
  hvac BOOLEAN NOT NULL,
  additional_details TEXT,

  -- Contact Information
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,

  -- Address Data
  full_address TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Estimate Results
  estimate_low INTEGER NOT NULL,
  estimate_high INTEGER NOT NULL,
  currency TEXT DEFAULT 'CAD' NOT NULL,

  -- Status Tracking
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'contacted', 'converted', 'rejected')),
  notes TEXT,

  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Create indexes for quotes table
CREATE INDEX idx_quotes_email ON quotes(email);
CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_use_case ON quotes(use_case);

-- Create meta_events table
CREATE TABLE meta_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  event_time TIMESTAMPTZ NOT NULL,

  -- Event Details
  event_name TEXT NOT NULL CHECK (event_name IN ('ViewContent', 'InitiateCheckout', 'Lead', 'CompleteRegistration')),
  event_id TEXT NOT NULL UNIQUE,

  -- Meta API Response
  api_response JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error_message TEXT,

  -- Data (hashed for privacy)
  user_data JSONB,
  custom_data JSONB,

  event_source_url TEXT,
  action_source TEXT DEFAULT 'website'
);

-- Create indexes for meta_events table
CREATE INDEX idx_meta_events_quote_id ON meta_events(quote_id);
CREATE INDEX idx_meta_events_event_name ON meta_events(event_name);
CREATE INDEX idx_meta_events_created_at ON meta_events(created_at DESC);
CREATE INDEX idx_meta_events_status ON meta_events(status);
CREATE INDEX idx_meta_events_event_id ON meta_events(event_id);

-- Enable Row Level Security
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quotes table
CREATE POLICY "Allow anonymous quote submissions"
ON quotes FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow authenticated read access"
ON quotes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated update access"
ON quotes FOR UPDATE TO authenticated USING (true);

-- RLS Policies for meta_events table
CREATE POLICY "Service role full access"
ON meta_events FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated read access"
ON meta_events FOR SELECT TO authenticated USING (true);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for quotes table
CREATE TRIGGER update_quotes_updated_at
BEFORE UPDATE ON quotes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
