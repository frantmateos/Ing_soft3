# ===========================
# Backend multi-stage build for Go (Linux/AMD64)
# ===========================

# ---------- 1️⃣ Builder stage ----------
FROM golang:1.22 AS builder
WORKDIR /src

# Copiar dependencias y descargarlas
COPY Golang/go.mod Golang/go.sum ./
RUN go mod download

# Copiar el resto del código
COPY Golang/ ./

# Compilar el binario para Linux AMD64 (CGO desactivado por compatibilidad)
ENV CGO_ENABLED=0 GOOS=linux GOARCH=amd64
RUN go build -o /app .

# ---------- 2️⃣ Final runtime stage ----------
FROM debian:bookworm-slim

# Instalar certificados SSL (para conectar con MySQL TLS)
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar el binario desde el builder
COPY --from=builder /app .

# Exponer el puerto de la app
EXPOSE 8081

# Comando de inicio
CMD ["./app"]
