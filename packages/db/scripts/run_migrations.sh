#!/usr/bin/env bash

source .env

# TODO: add checks for env instead of printing it.
echo "> Loaded environment variables."
echo "> Database: $DATABASE_URL"
echo "> Username: $POSTGRES_USER"
echo "> Password: $POSTGRES_PASSWORD"
echo "> Auth admin: $POSTGRES_ADMIN_PASSWORD"
echo "> Subcription Admin: $POSTGRES_SUBSCRIPTION_ADMIN"

./scripts/create_roles.sh

SQL_DIR="$(pwd)/migrations"
FILE_EXTENSION=".sql"


DB_COMMAND="psql $DATABASE_URL"

echo "> Running migrations from $SQL_DIR/better-auth-migrations.sql"
$DB_COMMAND -f "$SQL_DIR/better-auth-migrations.sql"

echo "> Running migrations from $SQL_DIR/init.sql"
$DB_COMMAND -f "$SQL_DIR/init.sql"

find "$SQL_DIR" -name "migration_*$FILE_EXTENSION" | sort -V | while read -r file; do
    echo "> Running migration: $file"
    set -e
    $DB_COMMAND -f "$file"
    set +e

    if [ $? -eq 0 ]; then
        echo ">> [SUCCESS] Migration completed."
    else
        echo ">> [FAILURE] Migration failed. Exited."
        exit 1
    fi
done

echo "> All migrations completed successfully."
