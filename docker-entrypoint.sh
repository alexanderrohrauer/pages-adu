#!/bin/sh
set -e

DOCKER_SOCK=/var/run/docker.sock

if [ -S "$DOCKER_SOCK" ]; then
  SOCK_GID=$(stat -c '%g' "$DOCKER_SOCK")
  SOCK_GROUP=$(getent group "$SOCK_GID" | cut -d: -f1)

  if [ -z "$SOCK_GROUP" ]; then
    SOCK_GROUP=docker-host
    groupadd --gid "$SOCK_GID" "$SOCK_GROUP"
  fi

  usermod -aG "$SOCK_GROUP" nextjs
fi

exec setpriv --reuid nextjs --regid nodejs --init-groups "$@"