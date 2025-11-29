-- API Logs table for tracking API requests
CREATE TABLE IF NOT EXISTS api_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    
    -- Request details
    method TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    path TEXT NOT NULL,
    
    -- Status
    status_code INTEGER NOT NULL,
    
    -- Metadata
    user_agent TEXT,
    ip_address TEXT,
    
    -- Request/Response bodies (stored as JSONB for flexibility)
    request_body JSONB,
    response_body JSONB,
    
    -- Timing
    duration_ms INTEGER, -- Request duration in milliseconds
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_api_logs_organization_id ON api_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON api_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_logs_status_code ON api_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_api_logs_api_key_id ON api_logs(api_key_id);

-- RLS Policies
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- Organization members can view their API logs
CREATE POLICY "Organization members can view API logs"
    ON api_logs FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
        )
    );

-- Service role can insert logs (from API middleware)
CREATE POLICY "Service role can insert API logs"
    ON api_logs FOR INSERT
    WITH CHECK (true);
