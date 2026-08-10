-- Stress analysis table
CREATE TABLE IF NOT EXISTS "stress_analyses" (
  id UUID PRIMARY KEY,
  "eventId" UUID NOT NULL REFERENCES "emergency_events"(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "audioUrl" TEXT NOT NULL,
  "stressLevel" DECIMAL(5, 2) NOT NULL,
  confidence DECIMAL(5, 2) NOT NULL,
  "voiceCharacteristics" JSONB,
  "analyzedAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stress_eventId ON "stress_analyses"("eventId");
CREATE INDEX idx_stress_userId ON "stress_analyses"("userId");
