# Stage 1: Build der React-App
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Bereitstellen der statischen Dateien
FROM alpine:latest
WORKDIR /app/dist
COPY --from=builder /app/dist .
# Kein EXPOSE oder CMD