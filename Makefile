# ─────────────────────────────────────────────────────
# infovoto-web
# ─────────────────────────────────────────────────────
# Corre desde infovoto-infra/ para Docker. Este Makefile
# es para desarrollo local directo (sin Docker).

.PHONY: help install dev build lint

help: ## Mostrar esta ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ── Setup ─────────────────────────────────────────────

install: ## Instalar dependencias npm
	npm install

dev: ## Levantar servidor de desarrollo (puerto 3000)
	npm run dev

build: ## Build de producción (detecta errores TypeScript)
	npm run build

lint: ## Linter Next.js (ESLint)
	npm run lint
