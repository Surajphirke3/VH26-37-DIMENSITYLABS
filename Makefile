.PHONY: help up down build logs migrate seed test lint install

help:
	@echo "MEND - X Dev Commands"
	@echo "  make up        — start all Docker services"
	@echo "  make down      — stop containers (keep data)"
	@echo "  make down-v    — stop containers + delete volumes"
	@echo "  make build     — rebuild images"
	@echo "  make logs      — tail all container logs"
	@echo "  make migrate   — run alembic upgrade head"
	@echo "  make seed      — seed demo users + machines"
	@echo "  make test      — run backend unit tests"
	@echo "  make install   — install backend deps in .venv"
	@echo "  make lint      — run ruff linter"

up:
	docker compose up -d

down:
	docker compose down

down-v:
	docker compose down -v

build:
	docker compose up --build -d

logs:
	docker compose logs -f

migrate:
	docker compose exec api alembic upgrade head

seed:
	cd backend && .venv/bin/python scripts/seed.py

demo-pdfs:
	docker compose exec api python scripts/create_demo_pdfs.py

test:
	cd backend && .venv/bin/pytest -m "not integration" -q

install:
	cd backend && python3 -m venv .venv && .venv/bin/pip install -r requirements.txt

lint:
	cd backend && .venv/bin/ruff check app/ || true

dev-api:
	cd backend && .venv/bin/uvicorn app.main:app --reload --port 8000

dev-frontend:
	cd frontend && npm run dev
