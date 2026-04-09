-- V3__fix_user_roles_schema.sql
-- Fix user roles schema - store roles as comma-separated string

-- Drop the problematic user_roles table if it exists
DROP TABLE IF EXISTS user_roles CASCADE;

-- Add roles column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS roles VARCHAR(255) DEFAULT 'USER' NOT NULL;
