CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY,
    event_type VARCHAR(255) NOT NULL,
    customer_id VARCHAR(255),
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON webhook_events(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);