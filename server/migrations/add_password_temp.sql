-- Add password_temp column to verification_codes table
-- This allows temporary storage of passwords during signup verification

ALTER TABLE verification_codes 
ADD COLUMN IF NOT EXISTS password_temp TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'verification_codes';
