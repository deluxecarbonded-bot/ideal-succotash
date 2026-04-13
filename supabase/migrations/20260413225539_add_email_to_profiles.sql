-- Add email column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Create index on email column for faster lookups
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);
