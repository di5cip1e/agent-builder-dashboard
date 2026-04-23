#!/bin/bash
set -e

# ============================================
# Agent Builder Dashboard - Deployment Script
# ============================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="agent-builder-dashboard"
PROJECT_DIR="/root/.openclaw/workspace/agent-builder-dashboard"
AGENTS_DIR="/opt/agents"
PORT_RANGE_START=3001
PORT_RANGE_END=3999

echo -e "${GREEN}=== Agent Builder Dashboard Deployment ===${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

# Navigate to project directory
cd "$PROJECT_DIR"

# Step 1: Install dependencies
echo -e "${YELLOW}[1/6] Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    npm ci --production=false
else
    npm ci
fi

# Step 2: Build the application
echo -e "${YELLOW}[2/6] Building application...${NC}"
npm run build

# Step 3: Create required directories
echo -e "${YELLOW}[3/6] Creating directories...${NC}"
mkdir -p "$AGENTS_DIR"
mkdir -p /var/log/agent-builder

# Step 4: Setup environment variables
echo -e "${YELLOW}[4/6] Setting up environment...${NC}"
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo -e "${GREEN}Created .env.local from template. Please update it with your values.${NC}"
    fi
fi

# Step 5: Configure PM2
echo -e "${YELLOW}[5/6] Configuring PM2...${NC}"
npm install -g pm2

# Stop existing instance if running
pm2 stop "$PROJECT_NAME" 2>/dev/null || true
pm2 delete "$PROJECT_NAME" 2>/dev/null || true

# Start the application with PM2
pm2 start "$PROJECT_DIR/scripts/pm2.config.js"
pm2 save

# Step 6: Setup Nginx
echo -e "${YELLOW}[6/6] Setting up Nginx...${NC}"
chmod +x "$PROJECT_DIR/scripts/nginx-setup.sh"

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}Nginx not found. Installing...${NC}"
    apt-get update && apt-get install -y nginx
fi

# Generate default nginx config for dashboard
cat > /etc/nginx/sites-available/agent-builder-dashboard << 'EOF'
server {
    listen 80;
    server_name dashboard.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Create symlink
ln -sf /etc/nginx/sites-available/agent-builder-dashboard /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Create port allocation file
if [ ! -f "$AGENTS_DIR/port-allocation.json" ]; then
    echo '{}' > "$AGENTS_DIR/port-allocation.json"
fi

# Final status
echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo ""
echo "Dashboard running at: http://localhost:3000"
echo "PM2 status: pm2 status"
echo "Logs: pm2 logs $PROJECT_NAME"
echo ""
echo "Next steps:"
echo "  1. Update .env.local with your Stripe and domain credentials"
echo "  2. Run 'sudo certbot --nginx -d dashboard.yourdomain.com' for HTTPS"
echo "  3. Run 'sudo $PROJECT_DIR/scripts/nginx-setup.sh' to generate agent configs"
echo ""