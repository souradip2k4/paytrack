#!/usr/bin/env bash

. ./scripts/is_root.sh

only_allow_git_root

if [ -f "$ENV_FILE" ]; then
    echo "INFO: $ENV_FILE found. Skipped generation."
    exit 1
fi

echo "INFO: Creating .env file..."
ENV_FILE="$GIT_ROOT/.env"
TEMP_ENV_FILE="$GIT_ROOT/.env.temp"

cp "$GIT_ROOT/.env.example" "$ENV_FILE"

# ---- Auto generate secrets ---- #
autogen_secret() {
    local VAR_KEY="$1"
    local VAR_VALUE="$2"
    local ENV_FILE_LOCAL="${ENV_FILE:-.env}"
    local TEMP_FILE_LOCAL="${TEMP_ENV_FILE:-.env.temp}"

    if [[ -z "$VAR_KEY" || -z "$VAR_VALUE" ]]; then
        echo "Usage: autogen_secret <secret_key> <secret_value>" >&2
        return 1
    fi

    awk -v key="$VAR_KEY" -v value="$VAR_VALUE" '
    {
        # Check if the line begins with the key followed by an '='
        if ($0 ~ ("^" key "=")) {
            print key "=" value;
            next;
        }
        print $0;
    }
    ' "$ENV_FILE_LOCAL" > "$TEMP_FILE_LOCAL"

    if [ $? -eq 0 ]; then
        mv "$TEMP_FILE_LOCAL" "$ENV_FILE_LOCAL"
        echo "INFO: Successfully set $VAR_KEY in $ENV_FILE_LOCAL."
        return 0
    else
        rm -f "$TEMP_FILE_LOCAL" 2>/dev/null
        echo "ERROR: Failed to update $VAR_KEY in $ENV_FILE_LOCAL." >&2
        return 1
    fi
}

autogen_secret "BETTER_AUTH_SECRET" "$(openssl rand -hex 32)"
autogen_secret "POSTGRES_PASSWORD" "$(openssl rand -hex 32)"
autogen_secret "POSTGRES_AUTH_ADMIN_PASSWORD" "$(openssl rand -hex 32)"
autogen_secret "POSTGRES_SUBSCRIPTION_ADMIN_PASSWORD" "$(openssl rand -hex 32)"