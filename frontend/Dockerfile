# ===========================
# Etapa 1: Build del React app
# ===========================
FROM node:16 AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund

COPY . ./

RUN npm run build

# ===========================
# Etapa 2: Servir con Nginx
# ===========================
FROM nginx:alpine

# Necesario para envsubst
RUN apk add --no-cache gettext

# Copiar el build al html
COPY --from=build /app/build /usr/share/nginx/html

# Template de nginx
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Custom entrypoint
RUN cp /docker-entrypoint.sh /docker-entrypoint.sh.original
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
