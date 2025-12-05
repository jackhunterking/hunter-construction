-- Migration: Meta CAPI Tracking Updates
-- Date: 2025-02-06
-- Description: Add columns for Meta Conversions API (CAPI) response logging
--              and update event_name constraint to support all standard Meta events

-- =====================================================
-- STEP 1: Add CAPI-specific columns to meta_events
-- =====================================================

-- Add pixel_id column for multi-pixel support
ALTER TABLE meta_events
  ADD COLUMN IF NOT EXISTS pixel_id TEXT;

-- Add capi_response column to store full API response
ALTER TABLE meta_events
  ADD COLUMN IF NOT EXISTS capi_response JSONB;

-- Add processing_status column for CAPI-specific status tracking
-- Different from existing 'status' which tracks general event status
ALTER TABLE meta_events
  ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending' 
  CHECK (processing_status IN ('pending', 'success', 'failed', 'skipped'));

-- =====================================================
-- STEP 2: Update event_name constraint
-- =====================================================

-- Drop existing constraint (may have been modified in previous migration)
ALTER TABLE meta_events 
  DROP CONSTRAINT IF EXISTS meta_events_event_name_check;

-- Add comprehensive constraint with all standard Meta events
ALTER TABLE meta_events
  ADD CONSTRAINT meta_events_event_name_check
  CHECK (event_name IN (
    -- Standard Meta events
    'PageView',
    'ViewContent', 
    'Lead',
    'CompleteRegistration',
    'InitiateCheckout',
    'AddToCart',
    'StartCheckout',
    'Purchase',
    'AddPaymentInfo',
    'AddToWishlist',
    'Contact',
    'CustomizeProduct',
    'Donate',
    'FindLocation',
    'Schedule',
    'Search',
    'SubmitApplication',
    'Subscribe'
  ));

-- =====================================================
-- STEP 3: Create indexes for new columns
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_meta_events_pixel_id 
  ON meta_events(pixel_id);

CREATE INDEX IF NOT EXISTS idx_meta_events_processing_status 
  ON meta_events(processing_status);

-- =====================================================
-- STEP 4: Update RLS policies for anon insert
-- =====================================================

-- Allow anonymous users to insert meta events (for CAPI Edge Function)
DROP POLICY IF EXISTS "anon_meta_events_insert" ON meta_events;
CREATE POLICY "anon_meta_events_insert" ON meta_events
  FOR INSERT TO anon WITH CHECK (true);

-- Allow service role full access (Edge Functions use service role)
DROP POLICY IF EXISTS "service_role_meta_events_all" ON meta_events;
CREATE POLICY "service_role_meta_events_all" ON meta_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =====================================================
-- STEP 5: Create view for CAPI event analytics
-- =====================================================

CREATE OR REPLACE VIEW meta_capi_analytics AS
SELECT 
  event_name,
  processing_status,
  COUNT(*) as event_count,
  COUNT(CASE WHEN processing_status = 'success' THEN 1 END) as success_count,
  COUNT(CASE WHEN processing_status = 'failed' THEN 1 END) as failed_count,
  ROUND(
    COUNT(CASE WHEN processing_status = 'success' THEN 1 END)::NUMERIC / 
    NULLIF(COUNT(*), 0) * 100, 2
  ) as success_rate,
  MAX(created_at) as last_event_at
FROM meta_events
WHERE pixel_id IS NOT NULL
GROUP BY event_name, processing_status
ORDER BY event_name, processing_status;

-- =====================================================
-- Migration complete
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Added columns: pixel_id, capi_response, processing_status';
  RAISE NOTICE 'Updated event_name constraint for all standard Meta events';
  RAISE NOTICE 'Created view: meta_capi_analytics';
END $$;
