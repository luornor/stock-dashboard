#!/usr/bin/env bash
set -Eeuo pipefail

echo "Applying base auth/contenttypes/accounts migrations..."
python manage.py migrate contenttypes --noinput
python manage.py migrate auth --noinput
python manage.py migrate accounts --noinput

echo "Applying all remaining migrations..."
python manage.py migrate --noinput

echo "Collecting static..."
python manage.py collectstatic --noinput

echo "Starting ASGI server..."
exec uvicorn core.asgi:application \
  --host 0.0.0.0 --port "${PORT:-8000}" --workers "${WEB_CONCURRENCY:-2}"
