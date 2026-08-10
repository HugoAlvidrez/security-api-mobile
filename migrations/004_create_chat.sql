-- Chat messages table
CREATE TABLE IF NOT EXISTS "chat_messages" (
  id UUID PRIMARY KEY,
  "eventId" UUID NOT NULL REFERENCES "emergency_events"(id) ON DELETE CASCADE,
  "senderId" UUID NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "senderRole" VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  "attachmentUrl" TEXT,
  "isRead" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chat_eventId ON "chat_messages"("eventId");
CREATE INDEX idx_chat_senderId ON "chat_messages"("senderId");
CREATE INDEX idx_chat_isRead ON "chat_messages"("isRead");
