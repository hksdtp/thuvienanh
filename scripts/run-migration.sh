#!/bin/bash
# Script to run database migrations
# Usage: ./scripts/run-migration.sh

set -e

echo "🚀 Starting database migration..."

# Check if Docker container is running
if ! docker ps | grep -q tva-postgres; then
    echo "❌ Error: PostgreSQL container 'tva-postgres' is not running"
    echo "   Please start the container first: docker-compose up -d"
    exit 1
fi

# Run migration
echo "📝 Running migration: 001_add_synology_fields.sql"
docker exec -i tva-postgres psql -U postgres -d fabric_library < database/migrations/001_add_synology_fields.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📊 Verifying changes..."
    docker exec -i tva-postgres psql -U postgres -d fabric_library -c "\d album_images"
else
    echo "❌ Migration failed!"
    exit 1
fi

