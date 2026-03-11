#!/bin/bash

# Simple MongoDB backup script
# Usage: ./backup.sh

# Load environment variables
if [ -f ../../.env.local ]; then
  export $(grep -v '^#' ../../.env.local | xargs)
fi

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="livreo_backup_$TIMESTAMP"

mkdir -p $BACKUP_DIR

echo "Starting backup of 'livreo' database..."

docker exec docker-mongo-1 mongodump \
  --username $MONGO_INITDB_ROOT_USERNAME \
  --password $MONGO_INITDB_ROOT_PASSWORD \
  --authenticationDatabase admin \
  --db livreo \
  --archive > "$BACKUP_DIR/$BACKUP_NAME.archive"

if [ $? -eq 0 ]; then
  echo "Backup successful: $BACKUP_DIR/$BACKUP_NAME.archive"
else
  echo "Backup failed!"
  exit 1
fi

# Keep only the last 7 days of backups
find $BACKUP_DIR -name "livreo_backup_*.archive" -mtime +7 -delete
echo "Old backups cleaned up."
