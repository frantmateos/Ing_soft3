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

# Crear configuración de nginx para React SPA
RUN cat > /etc/nginx/conf.d/default.conf <<'EOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Logs para debug
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log debug;

    # Habilitar CORS si es necesario
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Origin, Content-Type, Accept, Authorization' always;

    # Manejo de OPTIONS preflight
    if ($request_method = 'OPTIONS') {
        return 204;
    }

    # Configuración para SPA - todas las rutas van a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Archivos estáticos con cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Mostrar configuración y verificar
RUN cat /etc/nginx/conf.d/default.conf && \
    ls -lah /usr/share/nginx/html && \
    nginx -t

EXPOSE 80

# Ejecutar nginx en foreground
CMD ["nginx", "-g", "daemon off;"]