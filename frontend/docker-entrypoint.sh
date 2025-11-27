#!/bin/sh
set -e

export BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"

echo "Inyectando BACKEND_URL=${BACKEND_URL}"

envsubst '${BACKEND_URL}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

exec /docker-entrypoint.sh.original "$@"
