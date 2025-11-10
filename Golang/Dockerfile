# ===========================
# Backend multi-stage build for Go
# ===========================

# ---------- 1️⃣ Builder stage ----------
FROM golang:1.22 AS builder
WORKDIR /src

# Copy go.mod and go.sum and download deps first for caching
COPY Golang/go.mod Golang/go.sum ./
RUN go mod download

# Copy the rest of the backend sources
COPY Golang/ ./

# Enable CGO (needed for mysql) and build binary
ENV CGO_ENABLED=1
RUN go test ./... -coverprofile=coverage.out -covermode=atomic || true
RUN go build -o /app/app .

# ---------- 2️⃣ Final runtime stage ----------
FROM debian:bookworm-slim

# Install CA certificates to allow TLS MySQL connections
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Working directory for the app
WORKDIR /app

# Copy only the built binary
COPY --from=builder /app/app .

# Expose the correct port
EXPOSE 8081
ENV PORT=8081

# Run the compiled app
CMD ["./app"]
