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

echo "INFO: Running migrations from $SQL_DIR/better-auth-migrations.sql"
$DB_COMMAND -f "$SQL_DIR/better-auth-migrations.sql"
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to run migrations from $SQL_DIR/better-auth-migrations.sql"
    exit 1
fi

echo "INFO: Running migrations from $SQL_DIR/init.sql"
$DB_COMMAND -f "$SQL_DIR/init.sql"
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to run migrations from $SQL_DIR/init.sql"
    exit 1
fi

echo "INFO: All migrations completed successfully."
