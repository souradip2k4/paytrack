#!/usr/bin/env bash

. ./scripts/is_root.sh

if ! is_root; then
    echo "ERROR: This script must be run from the project root directory (git toplevel)."
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "INFO: No .env file found. Creating one..."
    cp .env.example .env

    sed "/^BETTER_AUTH_SECRET=/c\BETTER_AUTH_SECRET=$(openssl rand -hex 32)" .env > .env.tmp
    mv .env.tmp .env

    sed "/^POSTGRES_PASSWORD=/c\POSTGRES_PASSWORD=$(openssl rand -hex 32)" .env > .env.tmp
    mv .env.tmp .env

    sed "/^POSTGRES_AUTH_ADMIN_PASSWORD=/c\POSTGRES_AUTH_ADMIN_PASSWORD=$(openssl rand -hex 32)" .env > .env.tmp
    mv .env.tmp .env

    sed "/^POSTGRES_SUBSCRIPTION_ADMIN_PASSWORD=/c\POSTGRES_SUBSCRIPTION_ADMIN_PASSWORD=$(openssl rand -hex 32)" .env > .env.tmp
    mv .env.tmp .env

    echo "INFO: Generated .env file."
else
    echo "INFO: Found .env file. Skipping..."
fi

echo "INFO: Creating symlinks..."
ln -sfv "$(pwd)/.env" "$(pwd)/infra/.env"

for file in ./apps/*/package.json; do
    dir="$(dirname $file)"
    ln -sfv "$(pwd)/.env"
done

for file in ./packages/*/package.json; do
    dir="$(dirname $file)"
    ln -sfv "$(pwd)/.env" "${dir#./}/.env"
done

echo "INFO: Symlinks created."

