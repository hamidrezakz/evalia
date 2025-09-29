#!/usr/bin/env bash
set -euo pipefail

# Simple Postgres backup script (run from repo root)
# Creates gzip-compressed dump and enforces retention of last N backups.

DB_NAME=${DB_NAME:-doneplay}
DB_USER=${DB_USER:-postgres}
RETENTION=${RETENTION:-7}
OUT_DIR=${OUT_DIR:-backups}

mkdir -p "$OUT_DIR"
STAMP=$(date +%Y%m%d_%H%M%S)
FILE="$OUT_DIR/db_${STAMP}.sql.gz"

echo "[+] Creating backup $FILE"
sudo docker compose exec -T db pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$FILE"
echo "[✓] Backup created: $(ls -lh "$FILE" | awk '{print $5" "$9}')"

echo "[i] Enforcing retention (keep last $RETENTION)"
ls -1t "$OUT_DIR"/db_*.sql.gz 2>/dev/null | tail -n +$((RETENTION+1)) | xargs -r rm -f || true

echo "[✓] Done"