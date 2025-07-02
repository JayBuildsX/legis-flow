#!/bin/bash
# LEGIS-FLOW Database Restore Script for Docker
echo "🔄 Restoring LEGIS-FLOW database..."

# Wait for PostgreSQL to be ready
until pg_isready -h localhost -p 5432 -U postgres; do
  echo "⏳ Waiting for PostgreSQL..."
  sleep 2
done

# Restore the database
psql -h localhost -p 5432 -U postgres -d legisflow -f /docker-entrypoint-initdb.d/legisflow-backup.sql

echo "✅ Database restored successfully!"
