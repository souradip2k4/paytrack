#!/usr/bin/env bash

. ./scripts/is_root.sh
. ./scripts/require_envs.sh

only_allow_git_root

source ./.env

require_envs POSTGRES_DATABASE \
    POSTGRES_HOST \
    POSTGRES_PORT \
    POSTGRES_USER \
    POSTGRES_AUTH_ADMIN_USER \
    POSTGRES_SUBSCRIPTION_ADMIN_USER \
    POSTGRES_PASSWORD \
    POSTGRES_AUTH_ADMIN_PASSWORD \
    POSTGRES_SUBSCRIPTION_ADMIN_PASSWORD

./scripts/create_roles.sh

SQL_DIR="$GIT_ROOT/packages/core/migrations"
FILE_EXTENSION=".sql"

DB_URL_ROOT="postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST:$POSTGRES_PORT/$POSTGRES_DATABASE"
DB_COMMAND="psql $DB_URL_ROOT"

# Function to run a single migration file
run_migration() {
    local migration_file="$1"
    echo "INFO: Running migration from $migration_file"
    $DB_COMMAND -f "$migration_file"
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to run migration from $migration_file"
        exit 1
    fi
    echo "INFO: Successfully completed $migration_file"
}

# Run migrations in order:
# 1. better-auth-migrations.sql (auth tables)
# 2. init.sql (core schema)
# 3. All migration_*.sql files sorted by date
# 4. functions.sql (database functions)

run_migration "$SQL_DIR/better-auth-migrations.sql"
run_migration "$SQL_DIR/init.sql"

# Run all dated migration files in sorted order
echo "INFO: Running dated migrations in order..."
for migration_file in $(ls "$SQL_DIR"/migration_*.sql 2>/dev/null | sort); do
    run_migration "$migration_file"
done

run_migration "$SQL_DIR/functions.sql"

echo "INFO: All migrations completed successfully."
