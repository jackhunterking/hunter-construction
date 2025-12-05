-- Migration: Funnel Tracking for Multi-Page Forms
-- Date: 2025-02-05
-- Description: Create tables for tracking funnel sessions and step events
--              to support multi-page form architecture and Facebook Conversions API

-- =====================================================
-- STEP 1: Create funnel_sessions table
-- =====================================================

CREATE TABLE funnel_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Session identification
  session_id TEXT UNIQUE NOT NULL, -- localStorage session ID
  funnel_type TEXT NOT NULL CHECK (funnel_type IN ('basement', 'pod')),
  
  -- Progress tracking
  current_step INTEGER DEFAULT 1,
  completed_steps INTEGER[] DEFAULT '{}',
  form_data JSONB DEFAULT '{}',
  
  -- User identification (populated on email step)
  email TEXT,
  
  -- Conversion tracking
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  abandoned_at TIMESTAMPTZ,
  
  -- Source tracking (UTM parameters)
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  referrer TEXT,
  
  -- Facebook tracking parameters
  fbclid TEXT,
  fbc TEXT,
  fbp TEXT
);

-- Create indexes for funnel_sessions
CREATE INDEX idx_funnel_sessions_session_id ON funnel_sessions(session_id);
CREATE INDEX idx_funnel_sessions_funnel_type ON funnel_sessions(funnel_type);
CREATE INDEX idx_funnel_sessions_email ON funnel_sessions(email);
CREATE INDEX idx_funnel_sessions_created_at ON funnel_sessions(created_at DESC);
CREATE INDEX idx_funnel_sessions_completed_at ON funnel_sessions(completed_at);

-- =====================================================
-- STEP 2: Create funnel_events table
-- =====================================================

CREATE TABLE funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Relationships
  session_id TEXT NOT NULL REFERENCES funnel_sessions(session_id) ON DELETE CASCADE,
  
  -- Event details
  funnel_type TEXT NOT NULL CHECK (funnel_type IN ('basement', 'pod')),
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'complete', 'back', 'abandon')),
  
  -- Timing
  time_on_step_ms INTEGER,
  
  -- Page URL for Facebook tracking
  page_url TEXT
);

-- Create indexes for funnel_events
CREATE INDEX idx_funnel_events_session_id ON funnel_events(session_id);
CREATE INDEX idx_funnel_events_funnel_type ON funnel_events(funnel_type);
CREATE INDEX idx_funnel_events_step_number ON funnel_events(step_number);
CREATE INDEX idx_funnel_events_event_type ON funnel_events(event_type);
CREATE INDEX idx_funnel_events_created_at ON funnel_events(created_at DESC);

-- =====================================================
-- STEP 3: Update meta_events table
-- =====================================================

-- Drop existing constraint
ALTER TABLE meta_events 
  DROP CONSTRAINT IF EXISTS meta_events_event_name_check;

-- Add updated constraint with new event types
ALTER TABLE meta_events
  ADD CONSTRAINT meta_events_event_name_check
  CHECK (event_name IN (
    'ViewContent', 'InitiateCheckout', 'Lead', 'CompleteRegistration',
    'PageView', 'AddToCart', 'StartCheckout'
  ));

-- Add funnel session reference column
ALTER TABLE meta_events
  ADD COLUMN IF NOT EXISTS funnel_session_id TEXT REFERENCES funnel_sessions(session_id) ON DELETE SET NULL;

-- Create index for the new column
CREATE INDEX IF NOT EXISTS idx_meta_events_funnel_session_id ON meta_events(funnel_session_id);

-- =====================================================
-- STEP 4: Enable RLS and create policies
-- =====================================================

-- Enable RLS on funnel_sessions
ALTER TABLE funnel_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for funnel_sessions
CREATE POLICY "anon_funnel_sessions_insert" ON funnel_sessions
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_funnel_sessions_update" ON funnel_sessions
  FOR UPDATE TO anon USING (true);

CREATE POLICY "anon_funnel_sessions_select" ON funnel_sessions
  FOR SELECT TO anon USING (true);

CREATE POLICY "authenticated_funnel_sessions_all" ON funnel_sessions
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Enable RLS on funnel_events
ALTER TABLE funnel_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for funnel_events
CREATE POLICY "anon_funnel_events_insert" ON funnel_events
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_funnel_events_select" ON funnel_events
  FOR SELECT TO anon USING (true);

CREATE POLICY "authenticated_funnel_events_all" ON funnel_events
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =====================================================
-- STEP 5: Create trigger for updated_at
-- =====================================================

-- Create trigger for funnel_sessions (reuse existing function)
CREATE TRIGGER update_funnel_sessions_updated_at
BEFORE UPDATE ON funnel_sessions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 6: Create helper view for funnel analytics
-- =====================================================

CREATE OR REPLACE VIEW funnel_analytics AS
SELECT 
  fs.funnel_type,
  fs.current_step,
  COUNT(*) as session_count,
  COUNT(CASE WHEN fs.completed_at IS NOT NULL THEN 1 END) as completed_count,
  COUNT(CASE WHEN fs.abandoned_at IS NOT NULL THEN 1 END) as abandoned_count,
  ROUND(
    COUNT(CASE WHEN fs.completed_at IS NOT NULL THEN 1 END)::NUMERIC / 
    NULLIF(COUNT(*), 0) * 100, 2
  ) as completion_rate,
  AVG(EXTRACT(EPOCH FROM (fs.completed_at - fs.started_at)) / 60)::INTEGER as avg_completion_minutes
FROM funnel_sessions fs
GROUP BY fs.funnel_type, fs.current_step
ORDER BY fs.funnel_type, fs.current_step;

-- Create step-by-step drop-off view
CREATE OR REPLACE VIEW funnel_step_dropoff AS
SELECT
  funnel_type,
  step_number,
  step_name,
  COUNT(CASE WHEN event_type = 'view' THEN 1 END) as views,
  COUNT(CASE WHEN event_type = 'complete' THEN 1 END) as completions,
  COUNT(CASE WHEN event_type = 'abandon' THEN 1 END) as abandons,
  ROUND(
    COUNT(CASE WHEN event_type = 'complete' THEN 1 END)::NUMERIC / 
    NULLIF(COUNT(CASE WHEN event_type = 'view' THEN 1 END), 0) * 100, 2
  ) as step_completion_rate
FROM funnel_events
GROUP BY funnel_type, step_number, step_name
ORDER BY funnel_type, step_number;

-- =====================================================
-- Migration complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Created tables: funnel_sessions, funnel_events';
  RAISE NOTICE 'Updated table: meta_events (added funnel_session_id column)';
  RAISE NOTICE 'Created views: funnel_analytics, funnel_step_dropoff';
END $$;
