# ==============================================================================
# ParaliPay Production Multi-Stage Dockerfile
# ==============================================================================

# Stage 1: Build the React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
# Build production assets (Vite produces /app/frontend/dist)
RUN npm run build

# Stage 2: Production Python Backend & Unified Runtime
FROM python:3.12-slim AS runner
WORKDIR /app

# Set production environment flags
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application and models
COPY backend/ ./backend/

# Copy built frontend assets from Stage 1 into backend/dist for SPA serving
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose default port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/health || exit 1

# Start production server
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}
