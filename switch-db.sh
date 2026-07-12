#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

set -a
source ./.env
set +a

read -rp "Artifact ID: " ID
if [ -z "$ID" ]; then
  echo "Artifact ID must not be empty" >&2
  exit 1
fi
NAMESPACE="directus-$ID"

sed -i '' "s/^DIRECTUS_DB_DATABASE=.*/DIRECTUS_DB_DATABASE=$NAMESPACE/" ./.env
sed -i '' "s/^DIRECTUS_S3_BUCKET=.*/DIRECTUS_S3_BUCKET=$NAMESPACE/" ./.env

DB_USER="${DIRECTUS_DB_USER:-directus}"
EXISTS=$(docker compose exec -T directus-db psql -U "$DB_USER" -tAc \
  "SELECT 1 FROM pg_database WHERE datname='$NAMESPACE'")
if [ "$EXISTS" != "1" ]; then
  docker compose exec -T directus-db createdb -U "$DB_USER" -O "$DB_USER" "$NAMESPACE"
fi

docker compose down
docker compose up -d