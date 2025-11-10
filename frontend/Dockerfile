# ===========================
# Frontend multi-stage build (React + Nginx)
# ===========================

# ---------- 1️⃣ Build stage ----------
FROM --platform=linux/amd64 node:16 AS build
WORKDIR /app

# Copiar e instalar dependencias
COPY package*.json ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund

# Recibir la URL del backend como argumento
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Crear .env que React usa en build
COPY . ./
RUN if [ -n "$REACT_APP_BACKEND_URL" ]; then echo "REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL" > .env; fi
RUN npm run build

RUN ls -lah /app/build && test -f /app/build/index.html


# ---------- 2️⃣ Nginx stage ----------
FROM nginx:alpine

# Copiar el contenido compilado
COPY --from=build /app/build /usr/share/nginx/html

# Mostrar configuración y logs
RUN ls -lah /usr/share/nginx/html && nginx -t || true

EXPOSE 80

# Ejecutar nginx y mantener logs visibles (evita CrashLoopBackOff)
CMD ["/bin/sh", "-c", "nginx -g 'daemon off;'"]

