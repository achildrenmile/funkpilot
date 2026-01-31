#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f ".env.production" ]; then
    source .env.production
else
    echo -e "${RED}Error: .env.production file not found${NC}"
    echo "Copy .env.production.example to .env.production and configure it"
    exit 1
fi

# Validate required variables
REQUIRED_VARS="SYNOLOGY_HOST REMOTE_DIR CONTAINER_NAME IMAGE_NAME CONTAINER_PORT SITE_URL"
for var in $REQUIRED_VARS; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}Error: $var is not set in .env.production${NC}"
        exit 1
    fi
done

# Check that at least one API key is set
if [ -z "$GROQ_API_KEY" ] && [ -z "$ANTHROPIC_API_KEY" ] && [ -z "$OPENROUTER_API_KEY" ]; then
    echo -e "${RED}Error: At least one API key required (GROQ_API_KEY, ANTHROPIC_API_KEY, or OPENROUTER_API_KEY)${NC}"
    exit 1
fi

# Docker command (Synology uses a specific path)
DOCKER_CMD="${DOCKER_CMD:-/var/packages/Docker/target/usr/bin/docker}"

# Check for --rebuild flag
REBUILD_FLAG=""
if [ "$1" == "--rebuild" ]; then
    REBUILD_FLAG="--no-cache"
    echo -e "${YELLOW}Rebuild flag set - will build without cache${NC}"
fi

echo -e "${GREEN}=== Deploying FunkPilot to Synology ===${NC}"
echo "Host: $SYNOLOGY_HOST"
echo "Remote dir: $REMOTE_DIR"
echo "Container: $CONTAINER_NAME"
echo "Port: $CONTAINER_PORT"
echo ""

# Step 1: Sync code to Synology
echo -e "${GREEN}Step 1: Syncing code to Synology...${NC}"
ssh "$SYNOLOGY_HOST" "
    if [ -d '$REMOTE_DIR' ]; then
        cd '$REMOTE_DIR' && git pull
    else
        git clone $(git remote get-url origin) '$REMOTE_DIR'
    fi
"

# Step 2: Build Docker image on Synology
echo -e "${GREEN}Step 2: Building Docker image on Synology...${NC}"
ssh "$SYNOLOGY_HOST" "
    cd '$REMOTE_DIR'
    sudo $DOCKER_CMD build $REBUILD_FLAG -t '$IMAGE_NAME' .
"

# Step 3: Restart container
echo -e "${GREEN}Step 3: Restarting container...${NC}"
ssh "$SYNOLOGY_HOST" "
    # Stop and remove existing container if it exists
    sudo $DOCKER_CMD stop '$CONTAINER_NAME' 2>/dev/null || true
    sudo $DOCKER_CMD rm '$CONTAINER_NAME' 2>/dev/null || true

    # Start new container with environment variables
    sudo $DOCKER_CMD run -d \
        --name '$CONTAINER_NAME' \
        --restart unless-stopped \
        -p '$CONTAINER_PORT' \
        -e NODE_ENV=production \
        -e PORT=3001 \
        -e GROQ_API_KEY='${GROQ_API_KEY:-}' \
        -e ANTHROPIC_API_KEY='${ANTHROPIC_API_KEY:-}' \
        -e OPENROUTER_API_KEY='${OPENROUTER_API_KEY:-}' \
        -e TAVILY_API_KEY='${TAVILY_API_KEY:-}' \
        -e QRZ_USERNAME='${QRZ_USERNAME:-}' \
        -e QRZ_PASSWORD='${QRZ_PASSWORD:-}' \
        -e PARENT_SITE_NAME='$PARENT_SITE_NAME' \
        -e PARENT_SITE_URL='$PARENT_SITE_URL' \
        -e PARENT_SITE_LOGO='$PARENT_SITE_LOGO' \
        --health-cmd='wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1' \
        --health-interval=30s \
        --health-timeout=10s \
        --health-retries=3 \
        --health-start-period=10s \
        '$IMAGE_NAME'
"

# Step 4: Verify deployment
echo -e "${GREEN}Step 4: Verifying deployment...${NC}"
sleep 3

# Check container status
CONTAINER_STATUS=$(ssh "$SYNOLOGY_HOST" "sudo $DOCKER_CMD ps --filter 'name=$CONTAINER_NAME' --format '{{.Status}}'")
echo "Container status: $CONTAINER_STATUS"

# Check if site is accessible locally
echo "Checking local accessibility..."
LOCAL_PORT=$(echo $CONTAINER_PORT | cut -d: -f1)
if ssh "$SYNOLOGY_HOST" "curl -s -o /dev/null -w '%{http_code}' http://localhost:$LOCAL_PORT/api/health" | grep -q "200"; then
    echo -e "${GREEN}✓ Container is running on port $LOCAL_PORT${NC}"
else
    echo -e "${RED}✗ Container may not be accessible on port $LOCAL_PORT${NC}"
fi

# Check public URL (may fail if cloudflared not yet configured)
if curl -s -o /dev/null -w "%{http_code}" "$SITE_URL" 2>/dev/null | grep -q "200"; then
    echo -e "${GREEN}✓ Site is accessible at $SITE_URL${NC}"
else
    echo -e "${YELLOW}⚠ Public URL not yet accessible - ensure cloudflared is configured${NC}"
fi

echo ""
echo -e "${GREEN}=== Deployment complete ===${NC}"
echo ""
echo -e "${YELLOW}If this is first deployment, add to cloudflared config:${NC}"
echo "  - hostname: funkpilot.oeradio.at"
echo "    service: http://localhost:$LOCAL_PORT"
