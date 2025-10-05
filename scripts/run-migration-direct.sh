#!/bin/bash
# Script to run database migrations directly via psql
# Usage: ./scripts/run-migration-direct.sh

set -e

echo "🚀 Starting database migration (direct connection)..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set, using default connection"
    DB_HOST="${DB_HOST:-localhost}"
    DB_PORT="${DB_PORT:-5432}"
    DB_NAME="${DB_NAME:-fabric_library}"
    DB_USER="${DB_USER:-postgres}"
    
    export PGPASSWORD="${DB_PASSWORD:-postgres}"
    
    echo "📝 Running migration: 001_add_synology_fields.sql"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f database/migrations/001_add_synology_fields.sql
else
    echo "📝 Running migration: 001_add_synology_fields.sql"
    psql "$DATABASE_URL" -f database/migrations/001_add_synology_fields.sql
fi

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📊 Verifying changes..."
    if [ -z "$DATABASE_URL" ]; then
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "\d album_images"
    else
        psql "$DATABASE_URL" -c "\d album_images"
    fi
else
    echo "❌ Migration failed!"
    exit 1
fi

