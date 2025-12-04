-- Migration: Adapt schema from PodQuotes to Hunter Construction
-- Date: 2025-02-04
-- Description: Modify quotes table to support construction projects instead of pod configurations

-- =====================================================
-- STEP 1: Rename pod-specific column to project_type
-- =====================================================

ALTER TABLE quotes
  RENAME COLUMN use_case TO project_type;

-- =====================================================
-- STEP 2: Add construction-specific columns
-- =====================================================

ALTER TABLE quotes
  -- Project details
  ADD COLUMN project_subtype TEXT,
  ADD COLUMN property_type TEXT,
  ADD COLUMN lot_size TEXT,
  ADD COLUMN existing_units INTEGER DEFAULT 1,
  ADD COLUMN desired_units INTEGER DEFAULT 1,
  ADD COLUMN bedrooms_needed INTEGER,
  ADD COLUMN bathrooms_needed INTEGER,
  ADD COLUMN has_existing_plans BOOLEAN DEFAULT FALSE,

  -- Timeline and budget
  ADD COLUMN timeline_preference TEXT,
  ADD COLUMN budget_range TEXT,
  ADD COLUMN financing_needed BOOLEAN DEFAULT FALSE;

-- =====================================================
-- STEP 3: Drop pod-specific columns
-- =====================================================

-- Note: We're keeping these columns temporarily for backward compatibility
-- They can be dropped after verifying all data is migrated

-- ALTER TABLE quotes
--   DROP COLUMN IF EXISTS exterior_color,
--   DROP COLUMN IF EXISTS flooring,
--   DROP COLUMN IF EXISTS hvac;

-- Comment them out for now instead of dropping
COMMENT ON COLUMN quotes.exterior_color IS 'DEPRECATED: Legacy pod configuration field';
COMMENT ON COLUMN quotes.flooring IS 'DEPRECATED: Legacy pod configuration field';
COMMENT ON COLUMN quotes.hvac IS 'DEPRECATED: Legacy pod configuration field';

-- =====================================================
-- STEP 4: Add indexes for new columns
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_quotes_project_type ON quotes(project_type);
CREATE INDEX IF NOT EXISTS idx_quotes_property_type ON quotes(property_type);
CREATE INDEX IF NOT EXISTS idx_quotes_timeline ON quotes(timeline_preference);
CREATE INDEX IF NOT EXISTS idx_quotes_budget ON quotes(budget_range);
CREATE INDEX IF NOT EXISTS idx_quotes_desired_units ON quotes(desired_units);

-- =====================================================
-- STEP 5: Update comments for documentation
-- =====================================================

COMMENT ON TABLE quotes IS 'Hunter Construction project quotes and estimates';
COMMENT ON COLUMN quotes.project_type IS 'Type of construction project (Basement Unit, Garden Suite, Addition, Garage Conversion, Other)';
COMMENT ON COLUMN quotes.property_type IS 'Type of property (Single Family, Semi-Detached, Detached, Townhouse, Other)';
COMMENT ON COLUMN quotes.lot_size IS 'Lot size category (Small, Medium, Large, Very Large)';
COMMENT ON COLUMN quotes.existing_units IS 'Number of existing rental units on property';
COMMENT ON COLUMN quotes.desired_units IS 'Desired total number of rental units after project';
COMMENT ON COLUMN quotes.bedrooms_needed IS 'Number of bedrooms needed in new unit';
COMMENT ON COLUMN quotes.bathrooms_needed IS 'Number of bathrooms needed in new unit';
COMMENT ON COLUMN quotes.has_existing_plans IS 'Whether customer has existing architectural plans';
COMMENT ON COLUMN quotes.timeline_preference IS 'Preferred project timeline (ASAP, 3-6 months, 6-12 months, 12+ months, Flexible)';
COMMENT ON COLUMN quotes.budget_range IS 'Customer budget range (Under $100k, $100k-$200k, $200k-$300k, Over $300k, Not Sure)';
COMMENT ON COLUMN quotes.financing_needed IS 'Whether customer needs financing assistance';

-- =====================================================
-- STEP 6: Create helper view for construction quotes
-- =====================================================

CREATE OR REPLACE VIEW construction_quotes_summary AS
SELECT
  id,
  created_at,
  updated_at,
  email,
  full_name,
  phone,
  full_address,
  project_type,
  property_type,
  lot_size,
  existing_units,
  desired_units,
  bedrooms_needed,
  bathrooms_needed,
  timeline_preference,
  budget_range,
  financing_needed,
  estimate_low,
  estimate_high,
  currency,
  status,
  CASE
    WHEN status = 'estimate_sent' THEN 'Estimate Sent'
    WHEN status = 'submitted' THEN 'Awaiting Review'
    WHEN status = 'reviewed' THEN 'Under Review'
    WHEN status = 'contacted' THEN 'In Discussion'
    WHEN status = 'converted' THEN 'Accepted'
    WHEN status = 'rejected' THEN 'Declined'
    ELSE 'Unknown'
  END as status_display,
  (desired_units - existing_units) as additional_units,
  CONCAT('$', ROUND(estimate_low/1000), 'k - $', ROUND(estimate_high/1000), 'k ', currency) as estimate_display
FROM quotes
WHERE project_type IS NOT NULL -- Only show construction quotes
ORDER BY created_at DESC;

-- =====================================================
-- STEP 7: Grant permissions (if needed)
-- =====================================================

-- Grant select on view to authenticated users (if needed)
-- GRANT SELECT ON construction_quotes_summary TO authenticated;

-- =====================================================
-- Migration complete
-- =====================================================

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Added % new columns for construction projects', (
    SELECT COUNT(*)
    FROM information_schema.columns
    WHERE table_name = 'quotes'
      AND column_name IN (
        'project_subtype', 'property_type', 'lot_size',
        'existing_units', 'desired_units', 'bedrooms_needed',
        'bathrooms_needed', 'has_existing_plans',
        'timeline_preference', 'budget_range', 'financing_needed'
      )
  );
END $$;
