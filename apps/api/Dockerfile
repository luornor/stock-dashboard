# apps/api/Dockerfile
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /code

# System deps (psycopg needs libpq-dev if not using binary wheel)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev curl && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements first for layer caching
COPY requirements.txt /code/requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the rest of the project (including entrypoint.sh)
COPY . /code

# Ensure entrypoint is executable
RUN chmod +x /code/entrypoint.sh

EXPOSE 8000

# Start via entrypoint (runs migrate, collectstatic, then uvicorn)
CMD ["./entrypoint.sh"]
