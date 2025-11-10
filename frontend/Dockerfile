# ===========================
# Frontend multi-stage build (React + Nginx)
# Compatible con Azure Container Instances
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
FROM nginx:stable-alpine
# (sin --platform)

# Copiar el contenido compilado
COPY --from=build /app/build /usr/share/nginx/html

# Mostrar contenido y verificar configuración (debug útil en Azure)
RUN ls -lah /usr/share/nginx/html && nginx -t || true

# Exponer el puerto HTTP estándar
EXPOSE 80

# Ejecutar Nginx en modo foreground (requerido por Azure ACI)
CMD ["nginx", "-g", "daemon off;"]
