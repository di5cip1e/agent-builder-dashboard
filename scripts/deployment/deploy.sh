#!/bin/bash
# Multi-VPS Deployment Manager
# Usage: ./deploy.sh <agent-slug> <remote-vps-ip> [action]

AGENT_SLUG=$1
REMOTE_HOST=$2
ACTION=${3:-deploy}

# Config
SSH_USER="root"
SSH_KEY="/root/.ssh/deploy_key"
AGENT_DIR="/opt/agents"
REMOTE_AGENT_DIR="/opt/agents"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check prerequisites
check_prereqs() {
    if [ -z "$AGENT_SLUG" ] || [ -z "$REMOTE_HOST" ]; then
        echo "Usage: $0 <agent-slug> <remote-vps-ip> [deploy|stop|restart|logs]"
        exit 1
    fi
    
    if [ ! -d "$AGENT_DIR/$AGENT_SLUG" ]; then
        error "Agent $AGENT_SLUG not found in $AGENT_DIR"
        exit 1
    fi
    
    log "Checking SSH connection to $REMOTE_HOST..."
    ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no $SSH_USER@$REMOTE_HOST "echo 'OK'" > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        error "Cannot connect to $REMOTE_HOST via SSH"
        exit 1
    fi
    log "SSH connection OK"
}

# Deploy agent to remote VPS
deploy_agent() {
    log "Deploying agent $AGENT_SLUG to $REMOTE_HOST..."
    
    # Create remote directory
    ssh $SSH_USER@$REMOTE_HOST "mkdir -p $REMOTE_AGENT_DIR/$AGENT_SLUG"
    
    # Sync files (exclude node_modules, .git)
    log "Syncing files..."
    rsync -az --progress \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude 'web-app' \
        $AGENT_DIR/$AGENT_SLUG/ \
        $SSH_USER@$REMOTE_HOST:$REMOTE_AGENT_DIR/$AGENT_SLUG/
    
    # Install dependencies and start
    log "Installing dependencies and starting agent..."
    ssh $SSH_USER@$REMOTE_HOST << 'EOF'
        cd /opt/agents/AGENT_SLUG
        npm install 2>/dev/null || true
        pm2 stop AGENT_SLUG 2>/dev/null || true
        pm2 start npm --name AGENT_SLUG -- start
        pm2 save
EOF
        
    log "Agent $AGENT_SLUG deployed successfully!"
    log "URL: http://$REMOTE_HOST:3001"
}

# Stop agent
stop_agent() {
    log "Stopping agent $AGENT_SLUG on $REMOTE_HOST..."
    ssh $SSH_USER@$REMOTE_HOST "pm2 stop $AGENT_SLUG 2>/dev/null || true"
    log "Agent stopped"
}

# Restart agent
restart_agent() {
    log "Restarting agent $AGENT_SLUG on $REMOTE_HOST..."
    ssh $SSH_USER@$REMOTE_HOST "pm2 restart $AGENT_SLUG 2>/dev/null || true"
    log "Agent restarted"
}

# View logs
view_logs() {
    ssh $SSH_USER@$REMOTE_HOST "pm2 logs $AGENT_SLUG --lines 50 --nostream"
}

# Main
case $ACTION in
    deploy)
        check_prereqs
        deploy_agent
        ;;
    stop)
        stop_agent
        ;;
    restart)
        restart_agent
        ;;
    logs)
        view_logs
        ;;
    *)
        error "Unknown action: $ACTION"
        exit 1
        ;;
esac