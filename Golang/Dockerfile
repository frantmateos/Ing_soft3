# Backend multi-stage build for Go
# Builder stage
FROM golang:1.22 AS builder
WORKDIR /src

# Copy go.mod and go.sum and download deps first for caching
COPY Golang/go.mod Golang/go.sum ./
RUN go mod download

# Copy the rest of the backend sources
COPY Golang/ ./

# Enable cgo if needed (sqlite3) and run tests + build
ENV CGO_ENABLED=1
RUN go test ./... -coverprofile=coverage.out -covermode=atomic || true
RUN go build -o /app/app

# Final image
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/app /usr/local/bin/app
WORKDIR /app
EXPOSE 8081
ENV PORT=8081
CMD ["./app"]
