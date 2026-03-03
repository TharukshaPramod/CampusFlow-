-- =====================================================
-- CAMPUSFLOW - Initial Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS & AUTHENTICATION
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    profile_picture_url TEXT,
    provider VARCHAR(50), -- 'GOOGLE', 'LOCAL'
    provider_id VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    enabled BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- =====================================================
-- MODULE A: FACILITIES & ASSETS
-- =====================================================

CREATE TABLE resource_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'ROOM', 'LAB', 'EQUIPMENT'
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    resource_type_id UUID REFERENCES resource_types(id),
    code VARCHAR(50) UNIQUE, -- e.g., 'LH-101', 'PROJ-001'
    capacity INTEGER,
    location VARCHAR(255),
    floor VARCHAR(50),
    building VARCHAR(100),
    status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'OUT_OF_SERVICE', 'MAINTENANCE'
    metadata JSONB, -- Flexible metadata for resource-specific attributes
    images TEXT[], -- Array of image URLs
    available_from TIME,
    available_to TIME,
    available_days INTEGER[], -- 0=Sun, 1=Mon, etc.
    requires_approval BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE TABLE resource_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    feature_name VARCHAR(100) NOT NULL,
    feature_value VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resource_maintenance_schedule (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT,
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- =====================================================
-- MODULE B: BOOKING MANAGEMENT
-- =====================================================

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    resource_id UUID REFERENCES resources(id) NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    expected_attendees INTEGER,
    purpose VARCHAR(255),
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'
    rejection_reason TEXT,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    checked_in_by UUID REFERENCES users(id),
    qr_code TEXT,
    qr_code_expiry TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    CONSTRAINT check_booking_time CHECK (end_time > start_time)
);

CREATE TABLE booking_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    comment TEXT,
    performed_by UUID REFERENCES users(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MODULE C: INCIDENT TICKETING
-- =====================================================

CREATE TABLE incident_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    resource_id UUID REFERENCES resources(id),
    user_id UUID REFERENCES users(id) NOT NULL,
    assigned_to UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(50) DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    status VARCHAR(50) DEFAULT 'OPEN', -- 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'
    resolution_notes TEXT,
    rejection_reason TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    attachments TEXT[], -- Array of file paths/URLs
    first_response_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE TABLE ticket_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES incident_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) NOT NULL,
    comment TEXT NOT NULL,
    attachments TEXT[],
    is_internal BOOLEAN DEFAULT FALSE, -- Internal notes for staff
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

CREATE TABLE ticket_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES incident_tickets(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES ticket_comments(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MODULE D: NOTIFICATIONS
-- =====================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'BOOKING_UPDATE', 'TICKET_UPDATE', 'COMMENT', 'SYSTEM'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional data for deep linking
    reference_id UUID, -- ID of related entity (booking, ticket, etc.)
    reference_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT TRUE,
    push_enabled BOOLEAN DEFAULT TRUE,
    in_app_enabled BOOLEAN DEFAULT TRUE,
    booking_updates BOOLEAN DEFAULT TRUE,
    ticket_updates BOOLEAN DEFAULT TRUE,
    comments BOOLEAN DEFAULT TRUE,
    marketing BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- MODULE E: AUDIT LOGGING
-- =====================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    username VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_method VARCHAR(10),
    request_url TEXT,
    response_status INTEGER,
    execution_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider_provider_id ON users(provider, provider_id);

-- Resources indexes
CREATE INDEX idx_resources_type_status ON resources(resource_type_id, status);
CREATE INDEX idx_resources_location ON resources(building, floor);
CREATE INDEX idx_resources_code ON resources(code);

-- Bookings indexes
CREATE INDEX idx_bookings_resource_time ON bookings(resource_id, start_time, end_time);
CREATE INDEX idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX idx_bookings_status_time ON bookings(status, start_time);
CREATE INDEX idx_bookings_booking_number ON bookings(booking_number);

-- Tickets indexes
CREATE INDEX idx_tickets_resource_status ON incident_tickets(resource_id, status);
CREATE INDEX idx_tickets_assigned_status ON incident_tickets(assigned_to, status);
CREATE INDEX idx_tickets_priority_status ON incident_tickets(priority, status);
CREATE INDEX idx_tickets_ticket_number ON incident_tickets(ticket_number);

-- Notifications indexes
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at);

-- Audit logs indexes
CREATE INDEX idx_audit_logs_user_time ON audit_logs(user_id, created_at);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- =====================================================
-- INITIAL DATA (ROLES)
-- =====================================================

INSERT INTO roles (id, name, description) VALUES 
    (uuid_generate_v4(), 'ROLE_USER', 'Regular user who can book resources and create tickets'),
    (uuid_generate_v4(), 'ROLE_TECHNICIAN', 'Staff member who can handle incident tickets'),
    (uuid_generate_v4(), 'ROLE_MANAGER', 'Manager who can approve bookings and view reports'),
    (uuid_generate_v4(), 'ROLE_ADMIN', 'Administrator with full system access');

-- Insert default resource types
INSERT INTO resource_types (id, name, description, category, icon) VALUES
    (uuid_generate_v4(), 'Lecture Hall', 'Large lecture hall with projector and whiteboard', 'ROOM', 'lecture-hall'),
    (uuid_generate_v4(), 'Computer Lab', 'Computer laboratory with workstations', 'LAB', 'computer-lab'),
    (uuid_generate_v4(), 'Meeting Room', 'Small meeting room for discussions', 'ROOM', 'meeting-room'),
    (uuid_generate_v4(), 'Projector', 'Portable or fixed projector', 'EQUIPMENT', 'projector'),
    (uuid_generate_v4(), 'Camera', 'Video camera for recordings', 'EQUIPMENT', 'camera'),
    (uuid_generate_v4(), 'Science Lab', 'Science laboratory with equipment', 'LAB', 'science-lab');