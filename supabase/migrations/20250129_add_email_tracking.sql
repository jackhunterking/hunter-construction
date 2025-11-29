-- Update quotes table to support two-stage saves
-- Add new status for estimate_sent stage
ALTER TABLE quotes
  DROP CONSTRAINT IF EXISTS quotes_status_check;

ALTER TABLE quotes
  ADD CONSTRAINT quotes_status_check
  CHECK (status IN ('estimate_sent', 'submitted', 'reviewed', 'contacted', 'converted', 'rejected'));

-- Make contact fields optional for estimate_sent stage
ALTER TABLE quotes
  ALTER COLUMN full_name DROP NOT NULL,
  ALTER COLUMN phone DROP NOT NULL,
  ALTER COLUMN full_address DROP NOT NULL;

-- Create email_logs table for tracking all email activity
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Relationships
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,

  -- Email Details
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL CHECK (email_type IN ('estimate', 'confirmation')),
  subject TEXT NOT NULL,

  -- Delivery Tracking
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',    -- Queued for sending
    'sent',       -- Successfully sent to Resend
    'delivered',  -- Confirmed delivered (via webhook)
    'failed',     -- Failed to send
    'bounced',    -- Bounced (via webhook)
    'complained'  -- Spam complaint (via webhook)
  )),

  -- Resend Integration
  resend_id TEXT UNIQUE,  -- Resend email ID for tracking
  resend_response JSONB,  -- Full API response from Resend

  -- Error Handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  last_retry_at TIMESTAMPTZ,

  -- Template Data (for debugging/resending)
  template_data JSONB,

  -- Engagement Tracking (via webhooks - future)
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,

  -- Sent timestamp
  sent_at TIMESTAMPTZ
);

-- Indexes for common queries
CREATE INDEX idx_email_logs_quote_id ON email_logs(quote_id);
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_type ON email_logs(email_type);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX idx_email_logs_resend_id ON email_logs(resend_id);

-- RLS Policies for email_logs
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on email_logs"
ON email_logs FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated read access on email_logs"
ON email_logs FOR SELECT TO authenticated
USING (true);

-- Trigger for email_logs updated_at
CREATE TRIGGER update_email_logs_updated_at
BEFORE UPDATE ON email_logs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
