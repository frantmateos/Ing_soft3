# Frontend multi-stage build: build React app then serve with nginx
FROM node:16 AS build
WORKDIR /app

# copy package files and install deps
COPY package*.json ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund

# allow passing the backend URL at build time so the built JS points to correct API
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# create a .env file that react-scripts will pick up during build
COPY . ./
RUN if [ -n "$REACT_APP_BACKEND_URL" ]; then echo "REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL" > .env; fi
RUN npm run build

# Production image: serve the build with nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
