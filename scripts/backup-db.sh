#!/usr/bin/env bash
# Auto backup SQLite an toàn dùng sqlite3 .backup (online backup, không lock dài)
set -euo pipefail

DB_PATH="${DB_PATH:-/app/data/bot.sqlite}"
BACKUP_DIR="${BACKUP_DIR:-/app/data/backups}"
KEEP_DAYS="${BACKUP_KEEP_DAYS:-7}"

mkdir -p "$BACKUP_DIR"
TS=$(date -u +%Y%m%d_%H%M%S)
OUT="$BACKUP_DIR/bot_${TS}.sqlite"

if command -v sqlite3 >/dev/null 2>&1; then
  sqlite3 "$DB_PATH" ".backup '$OUT'"
else
  cp "$DB_PATH" "$OUT"
fi
gzip -f "$OUT"
echo "Backup OK: ${OUT}.gz"

# Xoá backup cũ hơn KEEP_DAYS ngày
find "$BACKUP_DIR" -type f -name "bot_*.sqlite.gz" -mtime +"$KEEP_DAYS" -delete || true
