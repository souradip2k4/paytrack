# Makefile for BudgetBee
# Run 'make help' to see available commands

.PHONY: help install setup-env docker-up docker-down create-roles migrate dev dummy-data backfill-jwks setup db-setup clean

# Default target
help:
	@echo "BudgetBee Development Commands"
	@echo "==============================="
	@echo ""
	@echo "Setup:"
	@echo "  make install      - Install dependencies with pnpm"
	@echo "  make setup-env    - Create .env file and symlink to all packages"
	@echo "  make setup        - Run full initial setup (install + setup-env)"
	@echo ""
	@echo "Database:"
	@echo "  make docker-up    - Start PostgreSQL and PostgREST containers"
	@echo "  make docker-down  - Stop all docker containers"
	@echo "  make create-roles - Create PostgreSQL roles"
	@echo "  make migrate      - Run all database migrations in order"
	@echo "  make db-setup     - Full database setup (docker-up + create-roles + migrate)"
	@echo ""
	@echo "Development:"
	@echo "  make dev          - Start all apps (docs, site, web)"
	@echo "  make dummy-data   - Push dummy data to the database"
	@echo "  make backfill-jwks - Fetch JWKS and set PGRST_JWT_SECRET in .env"
	@echo ""
	@echo "Utility:"
	@echo "  make clean        - Clean node_modules and build artifacts"

# ============================================
# Setup Commands
# ============================================

install:
	pnpm install

setup-env:
	chmod +x scripts/*
	./scripts/post_install.sh

setup: install setup-env db-setup backfill-jwks
	@echo "Setup complete! Don't forget to update your .env file."

# ============================================
# Database Commands
# ============================================

docker-up:
	cd infra && docker compose up -d
	@echo "Started docker infra!"

docker-down:
	cd infra && docker compose down
	@echo "Stopped docker infra!"

create-roles:
	@echo "Creating roles"
	./scripts/create_roles.sh
	@echo "Roles created successfully!"

migrate:
	./scripts/run_migrations.sh

db-setup:
	@echo "Starting PostgreSQL..."
	cd infra && PGRST_JWT_SECRET="ignore" docker compose up -d bu-postgres
	@echo "Waiting for PostgreSQL to be ready..."
	@echo "Streaming container logs (press Ctrl+C to abort):"
	@echo "=================================================="
	@source ./.env && \
	cd infra && docker compose logs -f bu-postgres & \
	LOG_PID=$$!; \
	source ./.env && \
	timeout=300; \
	while ! docker exec bu-postgres pg_isready -U $$POSTGRES_USER > /dev/null 2>&1; do \
		timeout=$$((timeout - 1)); \
		if [ $$timeout -le 0 ]; then \
			kill $$LOG_PID 2>/dev/null || true; \
			echo ""; \
			echo "ERROR: Timed out waiting for PostgreSQL to be ready"; \
			exit 1; \
		fi; \
		sleep 1; \
	done; \
	kill $$LOG_PID 2>/dev/null || true
	@echo ""
	@echo "=================================================="
	@echo "PostgreSQL is ready!"
	$(MAKE) create-roles
	$(MAKE) migrate
	@echo "Database setup complete!"

# ============================================
# Development Commands
# ============================================

dev:
	pnpm turbo dev

dummy-data:
	@echo "Pushing dummy data..."
	cd packages/core && pnpm tsx --env=.env ./scripts/initdb.ts

backfill-jwks:
	@echo "Starting web app to fetch JWKS..."
	@cd apps/web && pnpm dev & \
	WEB_PID=$$!; \
	trap "kill $$WEB_PID 2>/dev/null; pkill -P $$WEB_PID 2>/dev/null" EXIT; \
	./scripts/backfill_jwks.sh; \
	kill $$WEB_PID 2>/dev/null || true; \
	pkill -P $$WEB_PID 2>/dev/null || true
	@echo "JWKS backfill complete!"

# ============================================
# Utility Commands
# ============================================

clean:
	find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
	find . -name ".next" -type d -prune -exec rm -rf '{}' +
	find . -name ".turbo" -type d -prune -exec rm -rf '{}' +
	find . -name "dist" -type d -prune -exec rm -rf '{}' +
	@echo "Clean complete!"
