#!/usr/bin/env bash
# ==============================================================================
# Instagram AI Bot SaaS — PostgreSQL Automated Backup Script
# ==============================================================================
set -e

BACKUP_DIR="/var/backups/instagrambot"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/instagrambot_backup_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"

echo "📦 PostgreSQL veritabanı yedeği alınıyor..."
docker compose exec -T postgres pg_dump -U postgres instagrambot | gzip > "$BACKUP_FILE"

echo "✓ Yedek kaydedildi: $BACKUP_FILE"

# Clean up backups older than retention period
find "$BACKUP_DIR" -type f -name "instagrambot_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo "✓ $RETENTION_DAYS günden eski yedekler temizlendi."
