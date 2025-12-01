-- Migration: Add Multi-Tenant Organization Support
-- Created: 2024-12-01
-- Purpose: Enable B2B features with organizations, team members, and invitations

-- ============================================
-- 1. ORGANIZATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    industry VARCHAR(100),
    size VARCHAR(50) CHECK (size IN ('small', 'medium', 'large', 'enterprise')),
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'professional', 'enterprise', 'custom')),
    subscription_status VARCHAR(50) DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'suspended', 'cancelled')),
    max_members INTEGER DEFAULT 3, -- Enforced by subscription tier
    max_warranties INTEGER DEFAULT 50,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- 2. ORGANIZATION MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL, -- Links to users.id (currently uses email)
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer')),
    department VARCHAR(100),
    job_title VARCHAR(100),
    invited_by VARCHAR(255),
    joined_at TIMESTAMP DEFAULT NOW(),
    last_active_at TIMESTAMP,
    UNIQUE(organization_id, user_id)
);

-- ============================================
-- 3. INVITATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'member', 'viewer')),
    department VARCHAR(100),
    invited_by VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    accepted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    CHECK (expires_at > created_at)
);

-- ============================================
-- 4. UPDATE WARRANTIES TABLE
-- ============================================
-- Add organization support to existing warranties
ALTER TABLE warranties ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE warranties ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE warranties ADD COLUMN IF NOT EXISTS cost_center VARCHAR(100);
ALTER TABLE warranties ADD COLUMN IF NOT EXISTS asset_id VARCHAR(100);
ALTER TABLE warranties ADD COLUMN IF NOT EXISTS vendor VARCHAR(200);
ALTER TABLE warranties ADD COLUMN IF NOT EXISTS purchase_order_number VARCHAR(100);
ALTER TABLE warranties ADD COLUMN IF NOT EXISTS warranty_cost DECIMAL(12, 2);
ALTER TABLE warranties ADD COLUMN IF NOT EXISTS notes TEXT;

-- ============================================
-- 5. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_warranties_org_id ON warranties(organization_id);
CREATE INDEX IF NOT EXISTS idx_warranties_department ON warranties(department);
CREATE INDEX IF NOT EXISTS idx_warranties_user_org ON warranties(user_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- ============================================
-- 6. FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for organizations table
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create personal organization for new users
CREATE OR REPLACE FUNCTION create_personal_organization()
RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
BEGIN
    -- Create personal organization
    INSERT INTO organizations (name, slug, size, subscription_tier, max_members, max_warranties)
    VALUES (
        NEW.name || '''s Organization',
        'personal-' || LOWER(REPLACE(NEW.email, '@', '-at-')) || '-' || substr(md5(random()::text), 1, 6),
        'small',
        'free',
        1,
        50
    )
    RETURNING id INTO org_id;
    
    -- Add user as owner
    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (org_id, NEW.id, 'owner');
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-create personal org (only if users table exists)
-- Note: This will be enabled after migrating to PostgreSQL users table
-- DROP TRIGGER IF EXISTS create_personal_org_on_signup ON users;
-- CREATE TRIGGER create_personal_org_on_signup
--     AFTER INSERT ON users
--     FOR EACH ROW
--     EXECUTE FUNCTION create_personal_organization();

-- ============================================
-- 7. DEFAULT DATA (Optional)
-- ============================================

-- Create a demo organization for testing
-- INSERT INTO organizations (name, slug, industry, size, subscription_tier, max_members, max_warranties)
-- VALUES (
--     'Demo Company Inc.',
--     'demo-company',
--     'Technology',
--     'medium',
--     'professional',
--     20,
--     1000
-- );

COMMENT ON TABLE organizations IS 'Multi-tenant organizations for B2B accounts';
COMMENT ON TABLE organization_members IS 'Team members within each organization with role-based access';
COMMENT ON TABLE invitations IS 'Pending invitations to join organizations';
COMMENT ON COLUMN warranties.organization_id IS 'Links warranty to organization for B2B multi-tenancy';
COMMENT ON COLUMN warranties.asset_id IS 'Company asset identifier for tracking';
COMMENT ON COLUMN warranties.warranty_cost IS 'Cost of warranty for budgeting and ROI analysis';
