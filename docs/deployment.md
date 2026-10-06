# Production Deployment Guide

## 1. Containerized Deployment with Docker Compose

The fastest, most reliable production setup runs the complete stack with orchestrated health checks:

```bash
# Clone repository
git clone https://github.com/shahariarshawon/fitness_buddy-pro.git
cd fitness-buddy-pro

# Configure environment variables
cp .env.example .env

# Spin up MongoDB, API Server, and Web Client containers
docker-compose up -d --build

# Verify healthy status
docker-compose ps
```

- **Frontend Application**: `http://localhost:8080` (or configured reverse proxy)
- **Backend API Server**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/v1/health`

---

## 2. Cloud Server Deployment (Ubuntu / Debian VPS)

### Backend Service (PM2 Process Manager)
```bash
cd server
npm ci --omit=dev
npm run build # (if applicable)

# Launch via PM2
pm2 start src/server.js --name "fitness-buddy-pro-api" -i max
pm2 save
pm2 startup
```

### Frontend Static Serving (Nginx)
```bash
cd client
npm ci
npm run build

# Copy dist to webroot
sudo cp -r dist/* /var/www/fitnessbuddypro/
```

Configure Nginx with TLS via Certbot:
```nginx
server {
    server_name app.yourdomain.com;

    root /var/www/fitnessbuddypro;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 3. Serverless Deployment (Vercel)

Both `client/vercel.json` and `server/vercel.json` are pre-configured in the repository for one-click deployment to Vercel:

- **Client**: Connect GitHub repository, select `client` root directory, set framework preset to `Vite`.
- **Server**: Connect repository, select `server` root directory, set environment variables (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`).
