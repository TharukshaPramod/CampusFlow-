-- V2__standardize_audit_fields.sql
-- Add missing audit fields so all entities can safely extend BaseEntity without Hibernate validation failing.

-- resource_types
ALTER TABLE resource_types ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE resource_types ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE resource_types ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

-- roles
ALTER TABLE roles ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE roles ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE roles ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

-- users
ALTER TABLE users ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- resources
ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_created_by_fkey;
ALTER TABLE resources DROP CONSTRAINT IF EXISTS resources_updated_by_fkey;
ALTER TABLE resources ALTER COLUMN created_by TYPE VARCHAR(255);
ALTER TABLE resources ALTER COLUMN updated_by TYPE VARCHAR(255);
ALTER TABLE resources ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

-- resource_features
ALTER TABLE resource_features ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;
ALTER TABLE resource_features ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE resource_features ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- resource_maintenance_schedule
ALTER TABLE resource_maintenance_schedule DROP CONSTRAINT IF EXISTS resource_maintenance_schedule_created_by_fkey;
ALTER TABLE resource_maintenance_schedule ALTER COLUMN created_by TYPE VARCHAR(255);
ALTER TABLE resource_maintenance_schedule ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE resource_maintenance_schedule ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

-- bookings
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_created_by_fkey;
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_updated_by_fkey;
ALTER TABLE bookings ALTER COLUMN created_by TYPE VARCHAR(255);
ALTER TABLE bookings ALTER COLUMN updated_by TYPE VARCHAR(255);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

-- booking_history
ALTER TABLE booking_history ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;
ALTER TABLE booking_history ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE booking_history ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- incident_tickets
ALTER TABLE incident_tickets DROP CONSTRAINT IF EXISTS incident_tickets_created_by_fkey;
ALTER TABLE incident_tickets DROP CONSTRAINT IF EXISTS incident_tickets_updated_by_fkey;
ALTER TABLE incident_tickets ALTER COLUMN created_by TYPE VARCHAR(255);
ALTER TABLE incident_tickets ALTER COLUMN updated_by TYPE VARCHAR(255);
ALTER TABLE incident_tickets ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

-- ticket_comments
ALTER TABLE ticket_comments DROP CONSTRAINT IF EXISTS ticket_comments_created_by_fkey;
ALTER TABLE ticket_comments ALTER COLUMN created_by TYPE VARCHAR(255);
ALTER TABLE ticket_comments ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
ALTER TABLE ticket_comments ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;

-- ticket_attachments
ALTER TABLE ticket_attachments ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;
ALTER TABLE ticket_attachments ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE ticket_attachments ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- notification_preferences
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE notification_preferences ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);

-- audit_logs
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS created_by VARCHAR(255);
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS updated_by VARCHAR(255);
