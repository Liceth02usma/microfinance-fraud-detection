# CrediConfianza — Detección de Fraude en Microfinanzas

Prototipo de motor híbrido e inteligente para la detección de fraude en solicitudes de microcrédito de **CrediConfianza**, una cooperativa que atiende sectores urbanos y rurales. Combina **reglas expertas**, **redes bayesianas** y **machine learning**, con un módulo de equidad que elimina el sesgo histórico contra solicitantes rurales, mujeres y personas no bancarizadas.

> Fuentes de verdad: [`AGENTS.md`](./AGENTS.md) (reglas para agentes IA), [`docs/backlog.md`](./docs/backlog.md) (backlog de producto, 37 HU), [`COLLABORATING.md`](./COLLABORATING.md) (guía de colaboración).


## Estructura

```
backend/    # FastAPI + Pydantic (uv, pyproject.toml)
frontend/   # React + Vite + TypeScript
data/       # dataset sintético (outputs)
knowledge/  # reglas YAML/JSON, ontología, matriz de adquisición
models/     # modelos versionados
fairness/   # reportes de auditoría ética
docs/       # backlog, manual de gobierno, marco legal
.github/    # workflows CI + plantillas
```

## Puesta en marcha

### Backend (FastAPI)
```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```
Documentación interactiva: http://localhost:8000/docs

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Por defecto apunta a `http://localhost:8000` (ver `frontend/.env.example`).

## Pruebas y calidad

| Comando | Qué hace |
|---|---|
| `uv run pytest` (en `backend/`) | Pruebas backend + cobertura (gate ≥80%) |
| `npm run test:coverage` (en `frontend/`) | Pruebas frontend + cobertura (gate ≥80%) |
| `uv run ruff check . && uv run ruff format --check .` | Lint/format backend |
| `npm run lint` (en `frontend/`) | ESLint + Prettier |

Los hooks de `pre-commit` y la CI de GitHub aplican estas puertas automáticamente en cada PR a `main`.

## Contribuir
Lee [`COLLABORATING.md`](./COLLABORATING.md) antes de abrir un PR.
