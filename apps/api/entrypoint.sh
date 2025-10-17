#!/usr/bin/env bash
set -Eeuo pipefail

echo "Applying migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Starting ASGI server..."
# Use $PORT provided by Render (falls back to 8000 locally)
# Tune workers via WEB_CONCURRENCY env (default 2)
exec uvicorn core.asgi:application \
  --host 0.0.0.0 \
  --port "${PORT:-8000}" \
  --workers "${WEB_CONCURRENCY:-2}"
