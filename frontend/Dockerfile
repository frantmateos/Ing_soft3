# ===========================
# Etapa 1: Build del React app
# ===========================
FROM node:16 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund
COPY . ./
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
RUN npm run build

# ===========================
# Etapa 2: Servir con Nginx
# ===========================
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
