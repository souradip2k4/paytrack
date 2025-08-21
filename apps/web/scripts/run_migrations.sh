!/bin/sh

MIGRATIONS_DIR="$(pwd)/better-auth_migrations"
SQL_DIR="$(pwd)/sql"

FILE_EXTENSION=".sql"

while read -r line; do
  if [[ -z "$line" || "$line" =~ ^# ]]; then
    continue
  fi
  export "$line"
done < .env

echo "> Loaded environment variables."
echo "> Database: $DATABASE_URL"

DB_COMMAND="psql $DATABASE_URL"

if [ ! -d "$MIGRATIONS_DIR" ]; then
	echo "> Migrations directory not found: $MIGRATIONS_DIR"
	exit 1
fi

echo "> Running migrations from $MIGRATIONS_DIR"

find "$MIGRATIONS_DIR" -name "*$FILE_EXTENSION" | sort | while read -r file; do
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

echo "> Running migrations from $SQL_DIR/init.sql"
$DB_COMMAND -f "$SQL_DIR/init.sql"

echo "> All migrations completed successfully."
