# AGENTS.md

Project: **Sistema Inteligente de Detección de Fraude en Microfinanzas (CrediConfianza)**.
Role: AI + full-stack engineer working on a hybrid fraud-detection prototype for a microfinance cooperative serving urban **and** rural sectors.

> This repo is greenfield. The structure below is the agreed target architecture — follow it rather than inventing a new layout. Source of truth for scope: `docs/backlog.md` (37 HU en 7 épicas).

## Stack (do not substitute without reason)
- Python **3.10+**, strict type hints everywhere. Package manager: **`uv`** (`pyproject.toml`).
- Backend: **FastAPI + Pydantic + Uvicorn** (`backend/app/main.py` entrypoint, run with `uv run uvicorn app.main:app --reload` from `backend/`).
- Frontend: **React + Vite + TypeScript** (`frontend/src/main.tsx` entrypoint, run with `npm run dev` from `frontend/`). Connects to backend via `VITE_API_URL` env var.
- Bayesian reasoning: **`pgmpy`**.
- ML + explainability: **`scikit-learn`/`xgboost`** + **`shap`**.
- Fairness: **`fairlearn`** (demographic parity, Equalized Odds).
- Synthetic data: `pandas`, `numpy`, `faker`.
- Tests: **pytest** (backend), **Vitest + React Testing Library** (frontend). Coverage gate **≥ 80%** enforced in CI.

## Architecture constraints (these are easy to get wrong)
- Decision is a **hybrid of 3 layers** fused in `backend/app/engines/hybrid.py`:
  1. `rules.py` — hard filters / direct fraud indicators only (altered ID, restrictive lists, math inconsistencies).
  2. `bayesian.py` — `pgmpy` network modeling uncertainty over imperfect evidence (e.g. P(Fraude | Sin Cuentas, Ventas Plaza, Distancia Far)). Inference **< 1 s** per request.
  3. `ml_model.py` — supervised classifier producing predictive probability.
- Hybrid outputs a **unified risk score 0–100** and a classification: **verde** (approve) / **amarillo** (manual review) / **rojo** (reject/high alert). Formula + weights live in a config file.
- **A single weak signal presented in isolation must NEVER reach rojo** (automated test required — HU-18).
- If one motor fails or lacks data, respond with the other two and report which was missing.
- **The backend never executes a final automatic decision** — the system recommends, the human decides (HU-09, HU-26). Every analyst decision must record a reason, user, and model version.
- CORS: only origins in config are accepted (HU-17).
- Keep business logic **decoupled** from FastAPI controllers and from the React UI.

## Ethics — non-negotiable design goal
The system exists partly to **remove historical bias** against rural applicants, women, and unbanked people. Treat these as hard requirements, not nice-to-haves:
- **Rural weak signals must NOT imply fraud.** In the synthetic dataset, deliberately inject cases where the 13 weak signals do **not** correlate with fraud in the rural/agro sector (reflects real microcredit reality: efectivo, ferias, prepago, estacionalidad).
- `backend/app/ethics/` (root `/fairness/` holds reports) must compute **False Positive Rate by group** (rural vs urban, gender, ethnic/peasant group), report demographic parity + Equalized Odds, and suggest equitable threshold adjustments. Include confidence intervals for small groups.
- **Protected groups:** zona (rural/urbana), género, pertenencia étnica o campesina simulada. Each variable classified as **sensible / proxy potencial / neutral** (HU-04); decision to use sensitive vars in model vs only in audit must be justified in writing.
- Every decision must be **explainable**: SHAP values for ML, rule/bayes-weight breakdown otherwise. ≥3 explanatory factors per alert, ordered by weight, in plain language with rural context when applicable (HU-20).

## Signals (HU-02)
- **13 weak signals:** sin historial, vive lejos, sin local fijo, sin fiador, cédula de otra región, celular prepago, sin cuenta bancaria, factura manual, fotos poco convincentes, sin referencias comerciales, nombre distinto al del recibo, negocio pequeño para el monto, dirección sin georreferenciar.
- **6 strong indicators:** cédula alterada, ingresos inconsistentes, factura falsa, referencias falsas, historial adverso, negocio inconsistente.

## Rules engine (HU-10, HU-11)
- **20–30 rules** in YAML/JSON under `/knowledge`, validated against a schema. Each rule: ID, condition, weight, justification, source, category (strong/weak).
- Every weak-signal rule includes a **context condition** preventing it from flagging a legitimate rural applicant alone.
- Motor returns activated rules (ID, weight, justification) + sub-score 0–1. Reloads rules from file without code changes.
- One unit test per rule (one case activating, one not).

## Synthetic dataset (`backend/app/data/`)
- Size: **TBD** (not yet defined). Anonymized synthetic records, deterministic with a fixed seed.
- `fraude_real` label: rate **2–5% configurable**, similar rural/urban; used **only** for training/eval, never in production.
- Required fields: `tipo_zona` (urbana/rural), `ingresos_declarados`, `es_formal`, `historial_crediticio`, `celular_prepago`, `direccion_georreferenciada`, `garantia_titulada`, `genero`, `tipo_negocio` (plaza/parcela/local fijo), `es_fraude_real` (target), plus the 13 weak signals.
- Stratified train/val/test split by fraud + zona, stored with seed.

## API endpoints (FastAPI, prefix `/api/v1`)
- `POST /evaluate` — credit request → risk score, semáforo, active flags, bayesian probabilities, ML probability, explanatory factors, model version.
- `GET /ethics/audit` — consolidated parity report, FPR by group, global metrics (AUC, F1, Precision, Recall).
- `POST /data/generate` — regenerate synthetic dataset.
- OpenAPI/Swagger auto-generated. Pydantic DTOs in `backend/app/schemas/` define the contract from day one so frontend can build against examples.

## Frontend (React + Vite, 4 views in `frontend/src/views/`)
1. **Originación** — request form (urban + rural cases) + real-time verdict + explanation. Response < 3 s.
2. **Explicabilidad** — visual breakdown of why a case was flagged/legitimate (rules, SHAP, bayes).
3. **Auditoría Ética & Métricas** — FPR by zone, parity chart, confusion matrix, ethical compliance.
4. **Gobierno del Sistema** — rules diagram, Bayesian network structure, written policy manual.

## Reference cases (HU-27) — must exist as tests
1. Rural legítimo with several weak signals → **verde or amarillo, never rojo**.
2. Urbano fraudulento with strong signals → **rojo**.
3. Ambiguo → **amarillo**.

## Code standards
- Pydantic for all request/response DTOs in `backend/app/schemas/`.
- **Idioma:** código, identificadores, nombres de variables/funciones y mensajes de commit en **inglés**; docstrings, comentarios y toda documentación (`docs/`, `README.md`, explicaciones embebidas) en **español**.
- Inline-doc the **ethical assumptions** and the **probabilities/equations** assigned in the Bayesian network — these are auditable artifacts, not just code.
- Friendly error handling for validation failures and missing evidence, in both API and UI.

## Git
- Ramas con la convención `{accion}/{HU}` (ej. `feature/HU01-evaluacion-hibrida`, `fix/HU03-sesgo-rural`, `docs/HU05-gobierno`). `accion` ∈ `feature|fix|docs|refactor|test|chore`; `HU` = identificador de la historia de usuario.
- Commits Conventional Commits en inglés (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`).
- No push directo a `main`; todo via PR con revisión. Pre-commit hooks + CI enforced.
- Ver `COLLABORATING.md` para el flujo completo.

## Repo layout (target)
```
data/              # dataset sintético (outputs)
knowledge/         # reglas YAML/JSON, ontología, matriz de adquisición
models/            # modelos versionados (artefactos)
fairness/          # reportes de auditoría ética
backend/{app/{api/v1/routes,core,data,engines,ethics,schemas}, tests}
frontend/{src/{api,components,views,assets}, tests}
docs/              # backlog, manual de gobierno, marco legal
.github/           # workflows + plantillas
```
`engines/` = `{rules,bayesian,ml_model,hybrid}.py`. Do not collapse these into one file — the layer separation is part of the spec.
