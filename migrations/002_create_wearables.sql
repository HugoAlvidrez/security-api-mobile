-- Wearables table
CREATE TABLE IF NOT EXISTS "wearables" (
  id UUID PRIMARY KEY,
  "userId" UUID NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "deviceId" VARCHAR(255) NOT NULL,
  "deviceName" VARCHAR(255) NOT NULL,
  "deviceType" VARCHAR(100) NOT NULL,
  "pairingCode" VARCHAR(50),
  "isPaired" BOOLEAN DEFAULT false,
  "batteryLevel" DECIMAL(5, 2),
  "lastConnected" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("userId", "deviceId")
);

CREATE INDEX idx_wearables_userId ON "wearables"("userId");
CREATE INDEX idx_wearables_isPaired ON "wearables"("isPaired");
