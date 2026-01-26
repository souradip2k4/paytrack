#!/usr/bin/env bash

. ./scripts/is_root.sh
. ./scripts/require_envs.sh

only_allow_git_root

source ./.env

require_envs NEXT_PUBLIC_APP_URL

ENV_FILE="$GIT_ROOT/.env"
TEMP_ENV_FILE="$GIT_ROOT/.env.temp"

# ---- Helper function to get value of a key from .env file ---- #
get_env_value() {
    local VAR_KEY="$1"
    local FILE="$2"
    if [ -f "$FILE" ]; then
        grep "^${VAR_KEY}=" "$FILE" 2>/dev/null | cut -d'=' -f2-
    fi
}

# ---- Check if PGRST_JWT_SECRET already has a value ---- #
EXISTING_VALUE=$(get_env_value "PGRST_JWT_SECRET" "$ENV_FILE")
if [[ -n "$EXISTING_VALUE" ]]; then
    echo "INFO: PGRST_JWT_SECRET already has a value. Skipping."
    exit 0
fi

JWKS_URL="${NEXT_PUBLIC_APP_URL}/api/auth/jwks"

echo "INFO: JWKS URL: $JWKS_URL"

echo "INFO: Waiting for web app to be ready..."
timeout=120
while ! curl -s "$JWKS_URL" > /dev/null 2>&1; do
    timeout=$((timeout - 1))
    if [ $timeout -le 0 ]; then
        echo "ERROR: Timed out waiting for web app to be ready"
        exit 1
    fi
    echo "Waiting... ($timeout seconds remaining)"
    sleep 1
done

echo "INFO: Web app is ready!"

echo "INFO: Fetching JWKS from $JWKS_URL..."
JWKS_RESPONSE=$(curl -sf "$JWKS_URL")

if [ $? -ne 0 ] || [ -z "$JWKS_RESPONSE" ]; then
    echo "ERROR: Failed to fetch JWKS from $JWKS_URL"
    exit 1
fi

echo "INFO: JWKS Response: $JWKS_RESPONSE"

# For PostgREST, we need the full JWKS as the secret
PGRST_JWT_SECRET="$JWKS_RESPONSE"

# Update the .env file with the JWKS
echo "INFO: Updating PGRST_JWT_SECRET in $ENV_FILE..."

awk -v key="PGRST_JWT_SECRET" -v value="$PGRST_JWT_SECRET" '
{
    if ($0 ~ ("^" key "=")) {
        print key "=" value;
        next;
    }
    print $0;
}
' "$ENV_FILE" > "$TEMP_ENV_FILE"

if [ $? -eq 0 ]; then
    mv "$TEMP_ENV_FILE" "$ENV_FILE"
    echo "INFO: Successfully set PGRST_JWT_SECRET in $ENV_FILE"
else
    rm -f "$TEMP_ENV_FILE" 2>/dev/null
    echo "ERROR: Failed to update PGRST_JWT_SECRET in $ENV_FILE"
    exit 1
fi

echo ""
echo "INFO: JWKS backfill complete!"
echo "INFO: You can now restart PostgREST to use the new JWT secret."
