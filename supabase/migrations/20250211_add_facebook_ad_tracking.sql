-- Migration: Add Facebook Ad Tracking (HSA Parameters)
-- Date: 2025-02-11
-- Description: Adds Facebook HSA (HubSpot-style Attribution) parameters to funnel_sessions
-- and links inquiries to sessions for attribution tracking

-- Add HSA columns to funnel_sessions for Facebook ad attribution
ALTER TABLE funnel_sessions ADD COLUMN IF NOT EXISTS hsa_acc TEXT;
ALTER TABLE funnel_sessions ADD COLUMN IF NOT EXISTS hsa_cam TEXT;
ALTER TABLE funnel_sessions ADD COLUMN IF NOT EXISTS hsa_grp TEXT;
ALTER TABLE funnel_sessions ADD COLUMN IF NOT EXISTS hsa_ad TEXT;
ALTER TABLE funnel_sessions ADD COLUMN IF NOT EXISTS hsa_src TEXT;
ALTER TABLE funnel_sessions ADD COLUMN IF NOT EXISTS hsa_net TEXT;
ALTER TABLE funnel_sessions ADD COLUMN IF NOT EXISTS hsa_ver TEXT;

-- Add session_id foreign key to basement_inquiries for attribution
ALTER TABLE basement_inquiries ADD COLUMN IF NOT EXISTS session_id TEXT REFERENCES funnel_sessions(session_id);

-- Add session_id foreign key to quotes for attribution  
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS session_id TEXT REFERENCES funnel_sessions(session_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_funnel_sessions_hsa_cam ON funnel_sessions(hsa_cam);
CREATE INDEX IF NOT EXISTS idx_funnel_sessions_hsa_ad ON funnel_sessions(hsa_ad);
CREATE INDEX IF NOT EXISTS idx_basement_inquiries_session_id ON basement_inquiries(session_id);
CREATE INDEX IF NOT EXISTS idx_quotes_session_id ON quotes(session_id);

-- Add comments for documentation
COMMENT ON COLUMN funnel_sessions.hsa_acc IS 'Facebook Ad Account ID from HSA URL parameters';
COMMENT ON COLUMN funnel_sessions.hsa_cam IS 'Facebook Campaign ID from HSA URL parameters';
COMMENT ON COLUMN funnel_sessions.hsa_grp IS 'Facebook Ad Set ID from HSA URL parameters';
COMMENT ON COLUMN funnel_sessions.hsa_ad IS 'Facebook Ad ID from HSA URL parameters';
COMMENT ON COLUMN funnel_sessions.hsa_src IS 'Facebook Source/Placement from HSA URL parameters';
COMMENT ON COLUMN funnel_sessions.hsa_net IS 'Facebook Network from HSA URL parameters';
COMMENT ON COLUMN funnel_sessions.hsa_ver IS 'HSA Version from URL parameters';
COMMENT ON COLUMN basement_inquiries.session_id IS 'Links to funnel_sessions for attribution tracking';
COMMENT ON COLUMN quotes.session_id IS 'Links to funnel_sessions for attribution tracking';
