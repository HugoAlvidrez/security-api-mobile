-- Emergency events table
CREATE TABLE IF NOT EXISTS "emergency_events" (
  id UUID PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "wearableId" UUID NOT NULL REFERENCES "wearables"(id) ON DELETE SET NULL,
  "eventType" VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  description TEXT,
  "audioUrl" TEXT,
  "videoUrl" TEXT,
  "audioHash" VARCHAR(255),
  "videoHash" VARCHAR(255),
  location JSONB,
  "stressLevel" DECIMAL(5, 2),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "resolvedAt" TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_userId ON "emergency_events"("userId");
CREATE INDEX idx_events_status ON "emergency_events"(status);
CREATE INDEX idx_events_eventType ON "emergency_events"("eventType");
CREATE INDEX idx_events_createdAt ON "emergency_events"("createdAt");
