#!/bin/sh
set -e

# Use REACT_APP_BACKEND_URL if provided; otherwise leave empty so the app will use
# relative paths and rely on nginx proxying. Avoid setting a localhost default which
# would cause accidental cross-origin requests to `http://localhost:8080` from clients.
export BACKEND_URL="${REACT_APP_BACKEND_URL:-}"

echo "Inyectando BACKEND_URL=${BACKEND_URL}"

envsubst '${BACKEND_URL}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

# Create a small runtime env script that the client JS can read. This is written at container
# start so we can inject the real backend URL coming from the environment (Railway).
# The app can read `window.env.REACT_APP_BACKEND_URL` at runtime.
cat > /usr/share/nginx/html/env.js <<EOF
window.env = {
  REACT_APP_BACKEND_URL: "${BACKEND_URL}"
};
EOF

exec /docker-entrypoint.sh.original "$@"
