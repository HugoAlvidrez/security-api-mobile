-- Evidence chain of custody table
CREATE TABLE IF NOT EXISTS "evidence_chains" (
  id UUID PRIMARY KEY,
  "eventId" UUID NOT NULL REFERENCES "emergency_events"(id) ON DELETE CASCADE,
  "fileHash" VARCHAR(255) NOT NULL,
  "fileType" VARCHAR(50) NOT NULL,
  "fileSize" BIGINT NOT NULL,
  "uploadedBy" UUID NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "uploadedAt" TIMESTAMP NOT NULL,
  "isProtected" BOOLEAN DEFAULT true,
  watermark TEXT,
  "integrityHash" VARCHAR(255) NOT NULL,
  downloads JSONB DEFAULT '[]',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_evidence_eventId ON "evidence_chains"("eventId");
CREATE INDEX idx_evidence_fileHash ON "evidence_chains"("fileHash");
CREATE INDEX idx_evidence_uploadedBy ON "evidence_chains"("uploadedBy");
