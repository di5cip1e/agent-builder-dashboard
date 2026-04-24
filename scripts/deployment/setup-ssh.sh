#!/bin/bash
# SSH Key Setup for Deployment
# Run this on your local machine or builder VPS

set -e

DEPLOY_KEY="/root/.ssh/deploy_key"
SSH_DIR="/root/.ssh"

echo "=== SSH Key Setup for Multi-VPS Deployment ==="

# Create SSH directory
mkdir -p $SSH_DIR
chmod 700 $SSH_DIR

# Generate deploy key if not exists
if [ ! -f "$DEPLOY_KEY" ]; then
    echo "Generating SSH key..."
    ssh-keygen -t ed25519 -f "$DEPLOY_KEY" -N ""
    echo "Key created: $DEPLOY_KEY"
else
    echo "Key already exists: $DEPLOY_KEY"
fi

# Display public key
echo ""
echo "=== PUBLIC KEY ==="
echo "Add this to your remote VPS (/root/.ssh/authorized_keys):"
echo ""
cat "$DEPLOY_KEY.pub"
echo ""
echo "=================="

# Set permissions
chmod 600 "$DEPLOY_KEY"
chmod 644 "$DEPLOY_KEY.pub"

echo ""
echo "Done! Now copy the public key to your remote VPS:"
echo "  ssh root@YOUR_VPS_IP 'echo \"$(cat $DEPLOY_KEY.pub)\" >> /root/.ssh/authorized_keys'"