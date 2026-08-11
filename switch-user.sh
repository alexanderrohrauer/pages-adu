#!/usr/bin/env bash

docker compose down

docker volume rm pages_adu_workdir
docker volume rm pages_directus_db_data
docker volume rm pages_minio_data
docker volume rm pages_mongo_data
docker network rm pages_default

docker compose pull adu
docker compose up -d