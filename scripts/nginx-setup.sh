#!/bin/bash
set -e

# ============================================
# Nginx Setup Script - Auto-generate configs for agents
# ============================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

AGENTS_DIR="/opt/agents"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
PORT_RANGE_START=3001
PORT_RANGE_END=3999

# Domain suffix (configure this)
DOMAIN_SUFFIX="${DOMAIN_SUFFIX:-yourdomain.com}"

echo -e "${GREEN}=== Nginx Agent Config Generator ===${NC}"

if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Please run as root or with sudo${NC}"
    exit 1
fi

# Ensure directories exist
mkdir -p "$NGINX_SITES_AVAILABLE"
mkdir -p "$NGINX_SITES_ENABLED"

# Function to generate nginx config for an agent
generate_nginx_config() {
    local client_slug="$1"
    local port="$2"
    local domain="${client_slug}.${DOMAIN_SUFFIX}"
    
    local config_file="${NGINX_SITES_AVAILABLE}/agent-${client_slug}.conf"
    
    cat > "$config_file" << EOF
# Nginx config for agent: ${client_slug}
# Generated $(date -u +"%Y-%m-%d %H:%M:%S UTC")
# Port: ${port}

server {
    listen 80;
    server_name ${domain};

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Rate limiting
    limit_req zone=agent_limit burst=20 nodelay;

    location / {
        proxy_pass http://localhost:${port};
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Cache bypass for WebSocket
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:${port}/health;
        proxy_set_header Host $host;
    }

    # Logging
    access_log /var/log/nginx/agent-${client_slug}_access.log;
    error_log /var/log/nginx/agent-${client_slug}_error.log;
}
EOF

    # Create symlink
    if [ ! -L "${NGINX_SITES_ENABLED}/agent-${client_slug}.conf" ]; then
        ln -sf "$config_file" "${NGINX_SITES_ENABLED}/agent-${client_slug}.conf"
    fi
    
    echo -e "${GREEN}✓ Created config for ${domain} -> port ${port}${NC}"
}

# Function to remove nginx config for an agent
remove_nginx_config() {
    local client_slug="$1"
    
    local config_file="${NGINX_SITES_AVAILABLE}/agent-${client_slug}.conf"
    local symlink="${NGINX_SITES_ENABLED}/agent-${client_slug}.conf"
    
    if [ -L "$symlink" ]; then
        rm -f "$symlink"
        echo -e "${YELLOW}✓ Removed symlink for ${client_slug}${NC}"
    fi
    
    if [ -f "$config_file" ]; then
        rm -f "$config_file"
        echo -e "${YELLOW}✓ Removed config for ${client_slug}${NC}"
    fi
}

# Function to list all agent configs
list_configs() {
    echo -e "${GREEN}=== Active Agent Configurations ===${NC}"
    echo ""
    
    if [ -d "$NGINX_SITES_ENABLED" ]; then
        for config in "$NGINX_SITES_ENABLED"/agent-*.conf; do
            if [ -f "$config" ]; then
                basename "$config"
            fi
        done
    fi
    
    echo ""
    echo "Total configs: $(ls -1 "$NGINX_SITES_ENABLED"/agent-*.conf 2>/dev/null | wc -l)"
}

# Function to reload nginx
reload_nginx() {
    echo -e "${YELLOW}Testing and reloading Nginx...${NC}"
    if nginx -t; then
        systemctl reload nginx
        echo -e "${GREEN}✓ Nginx reloaded successfully${NC}"
    else
        echo -e "${RED}✗ Nginx config test failed${NC}"
        return 1
    fi
}

# Parse command line arguments
case "${1:-generate}" in
    generate)
        if [ -z "$2" ]; then
            echo "Usage: $0 generate <client-slug> <port>"
            echo "       $0 generate-all"
            exit 1
        fi
        
        if [ "$2" = "all" ]; then
            echo "Generating configs for all agents..."
            
            if [ -f "$AGENTS_DIR/port-allocation.json" ]; then
                # Parse JSON using grep and sed (portable)
                agent_dirs=$(find "$AGENTS_DIR" -maxdepth 1 -type d -not -name agents)
                
                for agent_dir in $agent_dirs; do
                    client_slug=$(basename "$agent_dir")
                    port=$(grep -o "\"$client_slug\":[0-9]*" "$AGENTS_DIR/port-allocation.json" | grep -o "[0-9]*" | head -1)
                    
                    if [ -n "$port" ]; then
                        generate_nginx_config "$client_slug" "$port"
                    fi
                done
            fi
        else
            client_slug="$2"
            port="$3"
            
            if [ -z "$port" ]; then
                echo -e "${RED}Port required${NC}"
                exit 1
            fi
            
            generate_nginx_config "$client_slug" "$port"
        fi
        
        reload_nginx
        ;;
    
    remove)
        if [ -z "$2" ]; then
            echo "Usage: $0 remove <client-slug>"
            exit 1
        fi
        
        remove_nginx_config "$2"
        reload_nginx
        ;;
    
    list)
        list_configs
        ;;
    
    reload)
        reload_nginx
        ;;
    
    *)
        echo "Usage: $0 {generate|remove|list|reload}"
        echo ""
        echo "Commands:"
        echo "  generate <slug> <port>  - Generate config for single agent"
        echo "  generate all            - Generate configs for all agents"
        echo "  remove <slug>           - Remove config for agent"
        echo "  list                    - List all active configs"
        echo "  reload                  - Test and reload nginx"
        exit 1
        ;;
esac

echo -e "${GREEN}=== Done ===${NC}"