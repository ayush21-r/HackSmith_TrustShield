#!/bin/bash
# Render startup script

echo "🔧 Running Prisma migrations..."
npx prisma migrate deploy

echo "🌱 Running seed..."
npm run seed

echo "🚀 Starting server..."
npm start
