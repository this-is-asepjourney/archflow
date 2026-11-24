#!/bin/sh
set -eu

export PORT="${PORT:-3000}"
export API_PORT="${API_PORT:-4000}"
export WEB_PORT="${WEB_PORT:-3001}"
export UPLOAD_DIR="${UPLOAD_DIR:-/app/apps/api/uploads}"

mkdir -p "$UPLOAD_DIR" /run/nginx /etc/nginx/http.d

rm -f /etc/nginx/http.d/*.conf
sed -e "s/__PORT__/${PORT}/g" \
    -e "s/__API_PORT__/${API_PORT}/g" \
    -e "s/__WEB_PORT__/${WEB_PORT}/g" \
    /app/docker/nginx.conf.template > /etc/nginx/http.d/default.conf

if [ -n "${DATABASE_URL:-}" ]; then
  echo "[ArchFlow] Syncing Prisma schema to PostgreSQL..."
  attempt=1
  max_attempts=10
  db_ready=0
  while [ "$attempt" -le "$max_attempts" ]; do
    if (cd /app/apps/api && ./node_modules/.bin/prisma db push --skip-generate --schema=./prisma/schema.prisma); then
      db_ready=1
      break
    fi
    echo "[ArchFlow] Database not ready yet (attempt ${attempt}/${max_attempts}), retrying in 3s..."
    attempt=$((attempt + 1))
    sleep 3
  done

  if [ "$db_ready" -ne 1 ]; then
    echo "[ArchFlow] ERROR: Failed to push Prisma schema after ${max_attempts} attempts."
    exit 1
  fi

  if [ "${SKIP_DB_SEED:-false}" != "true" ] && [ -f /app/apps/api/dist/prisma/seed.js ]; then
    echo "[ArchFlow] Running idempotent database seed..."
    if ! (cd /app/apps/api && node dist/prisma/seed.js); then
      echo "[ArchFlow] WARNING: Seed script failed; continuing startup."
    fi
  fi
else
  echo "[ArchFlow] WARNING: DATABASE_URL is not set; skipping Prisma schema sync and seed."
fi

API_PID=""
WEB_PID=""
NGINX_PID=""

cleanup() {
  echo "[ArchFlow] Shutting down services..."
  for pid in "$NGINX_PID" "$WEB_PID" "$API_PID"; do
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      kill -TERM "$pid" 2>/dev/null || true
    fi
  done
  wait 2>/dev/null || true
  exit 0
}

trap cleanup TERM INT

echo "[ArchFlow] Starting NestJS API on 0.0.0.0:${API_PORT}..."
(
  cd /app/apps/api
  exec env PORT="$API_PORT" API_PORT="$API_PORT" UPLOAD_DIR="$UPLOAD_DIR" NODE_OPTIONS="${API_NODE_OPTIONS:---max-old-space-size=256}" node dist/main.js
) &
API_PID=$!

echo "[ArchFlow] Starting Next.js Web on 127.0.0.1:${WEB_PORT}..."
(
  cd /app/web-standalone/apps/web
  exec env PORT="$WEB_PORT" HOSTNAME="127.0.0.1" INTERNAL_API_URL="http://127.0.0.1:${API_PORT}" NODE_OPTIONS="${WEB_NODE_OPTIONS:---max-old-space-size=256}" node server.js
) &
WEB_PID=$!

# Wait briefly for API and Web to bind before opening Nginx ingress
wait_count=0
while [ "$wait_count" -lt 15 ]; do
  if ! kill -0 "$API_PID" 2>/dev/null || ! kill -0 "$WEB_PID" 2>/dev/null; then
    echo "[ArchFlow] ERROR: A backend/frontend process exited during startup."
    cleanup
    exit 1
  fi
  if wget -q -O /dev/null "http://127.0.0.1:${API_PORT}/api/health" 2>/dev/null && \
     wget -q -O /dev/null "http://127.0.0.1:${WEB_PORT}/" 2>/dev/null; then
    break
  fi
  wait_count=$((wait_count + 1))
  sleep 1
done

echo "[ArchFlow] Starting Nginx reverse proxy on 0.0.0.0:${PORT}..."
nginx -g "daemon off;" &
NGINX_PID=$!

while kill -0 "$API_PID" 2>/dev/null && kill -0 "$WEB_PID" 2>/dev/null && kill -0 "$NGINX_PID" 2>/dev/null; do
  sleep 2
done

echo "[ArchFlow] ERROR: One of the ArchFlow processes exited unexpectedly."
for pid in "$NGINX_PID" "$WEB_PID" "$API_PID"; do
  if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
    kill -TERM "$pid" 2>/dev/null || true
  fi
done
wait 2>/dev/null || true
exit 1
