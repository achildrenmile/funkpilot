#!/bin/sh
set -e

# Generate config.json from environment variables
# Only overwrites if at least one variable is set

CONFIG_FILE="/app/dist/config.json"

# Check if any config env vars are set
if [ -n "$PARENT_SITE_URL" ] || [ -n "$PARENT_SITE_LOGO" ] || [ -n "$PARENT_SITE_NAME" ]; then
  echo "Generating config.json from environment variables..."

  cat > "$CONFIG_FILE" << EOF
{
  "parentSiteUrl": "${PARENT_SITE_URL:-}",
  "parentSiteLogo": "${PARENT_SITE_LOGO:-}",
  "parentSiteName": "${PARENT_SITE_NAME:-}"
}
EOF

  echo "Config generated:"
  cat "$CONFIG_FILE"
else
  echo "Using default config.json"
fi

# Execute the main command (node server)
exec "$@"
