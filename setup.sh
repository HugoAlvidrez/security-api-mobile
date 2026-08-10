#!/bin/bash

# Setup script for SecurityIA Fem Mobile API
# Usage: ./setup.sh

set -e

echo "🚀 Setting up SecurityIA Fem Mobile API..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check npm
echo -e "${BLUE}Checking npm installation...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}"

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Copy .env file
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created (please update with your values)${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

# Create uploads directory
echo -e "${BLUE}Creating uploads directory...${NC}"
mkdir -p uploads
mkdir -p logs
echo -e "${GREEN}✓ Directories created${NC}"

# Build TypeScript
echo -e "${BLUE}Building TypeScript...${NC}"
npm run build
echo -e "${GREEN}✓ Build complete${NC}"

# Database setup instructions
echo ""
echo -e "${BLUE}=====================================│${NC}"
echo -e "${BLUE}Database Setup Instructions${NC}"
echo -e "${BLUE}=====================================│${NC}"
echo ""
echo "1. Make sure PostgreSQL is installed and running"
echo "2. Create database:"
echo "   createdb security_ia_db"
echo ""
echo "3. Update credentials in .env file"
echo ""
echo "4. Run migrations:"
echo "   npm run migrate"
echo ""
echo "Or run all migrations at once:"
echo "   for file in migrations/*.sql; do psql security_ia_db < \"\$file\"; done"
echo ""

# Final instructions
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Update .env with your configuration"
echo "2. Set up PostgreSQL database"
echo "  3. Run migrations"
echo "  4. Start development server with: npm run dev"
echo ""
echo "API will be available at: http://localhost:3001"
echo "Swagger docs at: http://localhost:3001/api-docs"
echo ""
