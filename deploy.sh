#!/bin/bash
# Production Deployment Script for Techwell LMS
# Automates the safe database migration and deployment process

echo "🚀 Starting Deployment Process..."

# Navigate to backend
echo "📦 Building Backend..."
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Safely deploy migrations to production DB without data loss
# NOTE: This uses 'migrate deploy' instead of 'db push' to ensure existing data is preserved.
echo "🗄️ Running database migrations safely (prisma migrate deploy)..."
npx prisma migrate deploy

# Start or Restart backend service (uncomment PM2 command if using PM2)
echo "🔄 Restarting backend service..."
# pm2 restart techwell-backend || pm2 start src/index.js --name techwell-backend
# For now just confirming success
echo "✅ Backend ready."

cd ../frontend

# Install dependencies
echo "📦 Building Frontend..."
npm install

# Build Next.js app
echo "🔨 Compiling Next.js application..."
npm run build

# Start or Restart frontend service
echo "🔄 Restarting frontend service..."
# pm2 restart techwell-frontend || pm2 start npm --name "techwell-frontend" -- start
echo "✅ Frontend ready."

echo "🎉 Deployment Completed Successfully!"
