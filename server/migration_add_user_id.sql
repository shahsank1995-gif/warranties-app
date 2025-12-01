ALTER TABLE warranties ADD COLUMN IF NOT EXISTS user_id TEXT;
-- Optional: Add foreign key constraint if supported by your current data state
-- ALTER TABLE warranties ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id);
