COMPOSE  := docker compose
DEV      := UID=$(shell id -u) GID=$(shell id -g) $(COMPOSE) -f docker-compose.yml -f docker-compose.dev.yml
BACKEND_PORT   ?= 5000
ADMIN_WEB_PORT ?= 8080

.DEFAULT_GOAL := help
.PHONY: help up down logs ps dev dev-down test seed reseed psql clean

help: ## Show this help
	@awk 'BEGIN {FS = ":.*## "} /^[a-z-]+:.*## / {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Build and start the stack (db, api, admin web) in the background
	$(COMPOSE) up --build -d --wait
	@echo ""
	@echo "  Admin web   http://localhost:$(ADMIN_WEB_PORT)"
	@echo "  API docs    http://localhost:$(BACKEND_PORT)/docs"
	@echo "  Demo logins admin 0900000001 / demo1234   member 0911000001 / demo1234"

down: ## Stop the stack (keeps data)
	$(COMPOSE) down

logs: ## Follow logs
	$(COMPOSE) logs -f --tail=100

ps: ## Show container status
	$(COMPOSE) ps

dev: ## Start with hot reload (nodemon + Vite); admin web on http://localhost:5173
	$(DEV) up --build

dev-down: ## Stop the hot-reload stack
	$(DEV) down

test: ## Run the backend test suite in a container
	$(COMPOSE) --profile test run --rm --build backend-test

seed: ## Load demo data if the database is empty
	$(COMPOSE) exec backend node scripts/seed.js

reseed: ## WIPE the database and reload demo data
	$(COMPOSE) exec backend node scripts/seed.js --reset

psql: ## Open a psql shell in the database
	$(COMPOSE) exec db psql -U warriors -d warriors

clean: ## Stop the stack and DELETE its data volumes
	$(COMPOSE) down -v
