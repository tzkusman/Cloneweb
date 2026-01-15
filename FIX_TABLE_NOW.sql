-- ===== COMPLETE TABLE FIX - Run ALL of this in Supabase SQL Editor =====

-- STEP 1: Add the form_type column (REQUIRED - this is why inserts are failing!)
ALTER TABLE quotes_and_inquiries ADD COLUMN IF NOT EXISTS form_type VARCHAR(50);

-- STEP 2: Add other tracking columns
ALTER TABLE quotes_and_inquiries ADD COLUMN IF NOT EXISTS device_id VARCHAR(100);
ALTER TABLE quotes_and_inquiries ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE quotes_and_inquiries ADD COLUMN IF NOT EXISTS referrer TEXT;
ALTER TABLE quotes_and_inquiries ADD COLUMN IF NOT EXISTS page_url TEXT;
ALTER TABLE quotes_and_inquiries ADD COLUMN IF NOT EXISTS submission_ip VARCHAR(50);
ALTER TABLE quotes_and_inquiries ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE quotes_and_inquiries ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- STEP 3: Disable RLS (Row Level Security) so anonymous users can insert
ALTER TABLE quotes_and_inquiries DISABLE ROW LEVEL SECURITY;

-- Done! Now test your form.
