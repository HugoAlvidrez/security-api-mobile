-- Calendar events table
CREATE TABLE IF NOT EXISTS "calendar_events" (
  id UUID PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  "startTime" TIMESTAMP NOT NULL,
  "endTime" TIMESTAMP NOT NULL,
  reminder BOOLEAN DEFAULT false,
  "reminderMinutes" INTEGER,
  "agentId" UUID REFERENCES "users"(id) ON DELETE SET NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_calendar_userId ON "calendar_events"("userId");
CREATE INDEX idx_calendar_startTime ON "calendar_events"("startTime");
