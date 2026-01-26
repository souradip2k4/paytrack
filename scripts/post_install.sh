#!/usr/bin/env bash

. ./scripts/is_root.sh

only_allow_git_root

ENV_FILE="$GIT_ROOT/.env"
TEMP_ENV_FILE="$GIT_ROOT/.env.temp"
EXAMPLE_FILE="$GIT_ROOT/.env.example"

# ---- Helper function to get value of a key from .env file ---- #
get_env_value() {
    local VAR_KEY="$1"
    local FILE="$2"
    if [ -f "$FILE" ]; then
        grep "^${VAR_KEY}=" "$FILE" 2>/dev/null | cut -d'=' -f2-
    fi
}

# ---- Merge .env.example with existing .env (preserving existing values) ---- #
merge_env_files() {
    local EXAMPLE="$1"
    local EXISTING="$2"
    local OUTPUT="$3"

    if [ ! -f "$EXISTING" ]; then
        # No existing .env, just copy example
        cp "$EXAMPLE" "$OUTPUT"
        echo "INFO: Created new .env file from .env.example"
        return
    fi

    echo "INFO: Merging .env.example with existing .env (preserving existing values)..."
    
    # Start with existing .env content
    cp "$EXISTING" "$OUTPUT"
    
    # Add any new keys from .env.example that don't exist in .env
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip empty lines and comments
        if [[ -z "$line" || "$line" =~ ^# ]]; then
            continue
        fi
        
        # Extract key from line
        key=$(echo "$line" | cut -d'=' -f1)
        
        # Check if key exists in existing .env
        if ! grep -q "^${key}=" "$OUTPUT" 2>/dev/null; then
            echo "$line" >> "$OUTPUT"
            echo "INFO: Added new key $key from .env.example"
        fi
    done < "$EXAMPLE"
}

# Merge example with existing (or create new)
merge_env_files "$EXAMPLE_FILE" "$ENV_FILE" "$ENV_FILE"

# ---- Auto generate secrets (only if not already set) ---- #
autogen_secret() {
    local VAR_KEY="$1"
    local VAR_VALUE="$2"
    local ENV_FILE_LOCAL="${ENV_FILE:-.env}"
    local TEMP_FILE_LOCAL="${TEMP_ENV_FILE:-.env.temp}"

    if [[ -z "$VAR_KEY" || -z "$VAR_VALUE" ]]; then
        echo "Usage: autogen_secret <secret_key> <secret_value>" >&2
        return 1
    fi

    # Check if the key already has a non-empty value
    local EXISTING_VALUE
    EXISTING_VALUE=$(get_env_value "$VAR_KEY" "$ENV_FILE_LOCAL")
    if [[ -n "$EXISTING_VALUE" ]]; then
        echo "INFO: $VAR_KEY already has a value. Skipping."
        return 0
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
        echo "INFO: Auto-generated $VAR_KEY in $ENV_FILE_LOCAL."
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

echo "INFO: .env setup complete!"