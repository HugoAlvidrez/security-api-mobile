-- Users table
CREATE TABLE IF NOT EXISTS "users" (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  "passwordHash" VARCHAR(255) NOT NULL,
  "fullName" VARCHAR(255) NOT NULL,
  "phoneNumber" VARCHAR(20),
  "profileImage" TEXT,
  role VARCHAR(50) NOT NULL DEFAULT 'cliente',
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON "users"(email);
CREATE INDEX idx_users_role ON "users"(role);
