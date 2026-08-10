-- Personal notes table
CREATE TABLE IF NOT EXISTS "personal_notes" (
  id UUID PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  "isPinned" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notes_userId ON "personal_notes"("userId");
CREATE INDEX idx_notes_isPinned ON "personal_notes"("isPinned");
