#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
RETENTION_DAYS=7

echo "==> starting database backup pipeline..."

# 1. Validate environment variables to avoid empty file failures
if [ -z "${DATABASE_URL:-}" ]; then
  if [ -z "${POSTGRES_USER:-}" ] || [ -z "${POSTGRES_DB:-}" ] || [ -z "${POSTGRES_PASSWORD:-}" ]; then
    echo "ERROR: DATABASE_URL or POSTGRES_USER/DB/PASSWORD parameters not defined. Aborting." >&2
    exit 1
  fi
  # Reconstruct URL for pg_dump if individual credentials are given
  POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
  POSTGRES_PORT="${POSTGRES_PORT:-5432}"
  PG_CONN="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"
else
  PG_CONN="${DATABASE_URL}"
fi

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

DATE_STR=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="${BACKUP_DIR}/continue-backup-${DATE_STR}.sql.gz"

echo "==> executing pg_dump..."

# 2. Run pg_dump, pipe to gzip, write to file
if ! pg_dump "${PG_CONN}" --no-owner --no-acl | gzip -9 > "${BACKUP_FILE}"; then
  echo "ERROR: pg_dump export command pipeline failed." >&2
  rm -f "${BACKUP_FILE}"
  exit 1
fi

# 3. Integrity verification: Check nonzero file size
if [ ! -s "${BACKUP_FILE}" ]; then
  echo "ERROR: Backup file created but is empty (zero bytes)." >&2
  rm -f "${BACKUP_FILE}"
  exit 1
fi

# 4. Integrity verification: Check gzip archive health
echo "==> verifying archive integrity..."
if ! gzip -t "${BACKUP_FILE}"; then
  echo "ERROR: Gzip archive integrity validation failed." >&2
  rm -f "${BACKUP_FILE}"
  exit 1
fi

echo "==> backup successful: ${BACKUP_FILE} (size: $(du -sh "${BACKUP_FILE}" | cut -f1))"

# 5. Clean up files older than RETENTION_DAYS
echo "==> checking backup file rotations (retention: ${RETENTION_DAYS} days)..."
find "${BACKUP_DIR}" -name "continue-backup-*.sql.gz" -type f -mtime +"${RETENTION_DAYS}" -delete -print | while read -r expired; do
  echo "==> purged expired backup: ${expired}"
done

echo "==> database backup pipeline finished."
