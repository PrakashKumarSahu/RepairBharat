# Stage 1: Build the React frontend
FROM node:20-slim AS frontend-builder
WORKDIR /app

# Install dependencies
COPY frontend/package*.json ./
RUN npm install

# Copy frontend source and build assets
COPY frontend/ ./
RUN npm run build

# Stage 2: Serve compiled React static files with Nginx
FROM nginx:alpine
COPY --from=frontend-builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
