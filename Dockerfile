# Stage 1: Build React SPA
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Build argument for API URL (default to /api reverse proxy)
ARG API_BASE_URL=/api
ENV API_BASE_URL=$API_BASE_URL

# Build production bundle
RUN npm run build

# Stage 2: Serve with lightweight Nginx
FROM nginx:alpine

# Copy custom Nginx configuration for React Router SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
