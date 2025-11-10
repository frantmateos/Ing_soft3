# ===========================
# Frontend multi-stage build (React + Nginx)
# Compatible con Azure Container Instances (arm64 / amd64)
# ===========================

# ---------- 1️⃣ Build stage ----------
FROM node:16 AS build
WORKDIR /app

# Copiar e instalar dependencias
COPY package*.json ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund

# Recibir la URL del backend como argumento
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Copiar el código fuente y compilar el build
COPY . ./
RUN if [ -n "$REACT_APP_BACKEND_URL" ]; then \
      echo "REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL" > .env; \
    fi && \
    npm run build && \
    ls -lah /app/build && \
    test -f /app/build/index.html

# ---------- 2️⃣ Nginx stage ----------
FROM --platform=$TARGETPLATFORM nginx:stable-alpine-slim

# Copiar el contenido compilado
COPY --from=build /app/build /usr/share/nginx/html

# Mostrar contenido y verificar configuración
RUN ls -lah /usr/share/nginx/html && nginx -t || true

# Exponer puerto
EXPOSE 80

# Mantener logs visibles (requerido para ACI)
CMD ["nginx", "-g", "daemon off;"]
