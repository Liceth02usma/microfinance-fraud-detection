# 🤝 Guía de Colaboración (Colaboratorio)

Gracias por tu interés en colaborar en este proyecto. Este documento define los estándares, la arquitectura y las reglas que todos los participantes (humanos o IA) deben seguir.

---

## 🎯 1. Propósito del Proyecto
* **Objetivo principal:** Construir un prototipo de motor híbrido e inteligente de detección de fraude para **CrediConfianza**, una cooperativa de microfinanzas que atiende sectores urbanos y rurales. El sistema combina reglas expertas, redes bayesianas y machine learning para evaluar el riesgo de fraude, entregar explicabilidad transparente y eliminar el sesgo histórico contra solicitantes rurales, mujeres y personas no bancarizadas.
* **Alcance:** Incluye generación de dataset sintético, tres motores de razonamiento, fusión del puntaje, explicabilidad, métricas de equidad, auditoría ética, API FastAPI y frontend React. Quedan fuera los datos reales de asociados y el despliegue a producción.

> Fuentes de verdad: [`AGENTS.md`](./AGENTS.md) (reglas para agentes IA), [`docs/backlog.md`](./docs/backlog.md) (backlog de 37 HU), este archivo.

---

## 🛠️ 2. Arquitectura y Stack Tecnológico
* **Lenguaje principal:** Python 3.10+ (backend) y TypeScript (frontend).
* **Frameworks:** FastAPI + Pydantic + Uvicorn (backend); React 18 + Vite (frontend).
* **Gestor de paquetes backend:** `uv` con `pyproject.toml`.
* **Razonamiento probabilístico:** `pgmpy`.
* **ML y explicabilidad:** `scikit-learn` / `xgboost` + `shap`.
* **Equidad:** `fairlearn`.
* **Datos sintéticos:** `pandas`, `numpy`, `faker`.
* **Pruebas:** `pytest` (backend), `vitest` + React Testing Library (frontend).
* **Estándar de código:** Ruff (Python), ESLint + Prettier (TypeScript). Tipado estricto en ambos lados.

---

## 📂 3. Estructura del Repositorio
```text
microfinance-fraud-detection/
├── .github/              # Workflows CI y plantillas de PR
├── backend/              # API FastAPI (app/, tests/, pyproject.toml)
├── frontend/             # App React + Vite (src/, tests/)
├── data/                 # Dataset sintético (outputs)
├── knowledge/            # Reglas YAML/JSON, ontología, matriz de adquisición
├── models/               # Modelos versionados (artefactos)
├── fairness/             # Reportes de auditoría ética
├── docs/                 # Backlog, manual de gobierno, marco legal
├── .pre-commit-config.yaml
├── .gitignore
├── AGENTS.md             # Reglas para sesiones de IA
├── COLLABORATING.md      # Este archivo
└── README.md
```

---

## 🚦 4. Flujo de Trabajo (Git Workflow)
1. **Crear una rama** con la convención `{accion}/{HU}`:
   * `feature/HU17-servicio-fastapi`
   * `fix/HU03-sesgo-rural`
   * `docs/HU05-gobierno`
   * `refactor/HU18-fusion`
   * `test/HU27-casos-referencia`
   * `chore/HU01-scaffold`
   * `accion` ∈ `feature | fix | docs | refactor | test | chore`; `HU` = identificador de la historia de usuario del backlog.
2. **Commit semántico** (Conventional Commits, en **inglés**):
   * `feat(backend): add hybrid risk score fusion`
   * `fix(frontend): handle missing evidence in form`
   * `docs: add bayesian network diagram`
   * Tipos permitidos: `feat, fix, docs, refactor, test, chore, style, perf, ci, build`.
3. **Pull Request:**
   * Abre el PR contra `main` y vincula la HU relacionada.
   * Completa la plantilla de PR (`.github/pull_request_template.md`).
   * La CI ejecuta lint, pruebas y cobertura para backend y frontend.
   * Otra persona debe revisar y aprobar antes de integrar a `main`.

---

## ⚠️ 5. Restricciones y Reglas Importantes
* **No modificar** directamente la rama `main` (el hook `no-commit-to-branch` lo bloquea).
* **No subir** credenciales, claves API, archivos `.env` o datos sensibles al repositorio.
* **Escribir pruebas** para cada nueva función; la cobertura mínima es **≥ 80%** (backend y frontend), exigida por la CI.
* **Idioma:** código, identificadores, nombres de variables/funciones y mensajes de commit en **inglés**; docstrings, comentarios y toda documentación en **español**.
* **Documentar** las funciones complejas y, en particular, los supuestos éticos y las probabilidades asignadas en la red bayesiana (son artefactos auditables).
* **El sistema recomienda, la persona decide:** ninguna ruta del backend ejecuta una decisión final automática; toda decisión del analista debe registrar motivo, usuario y versión del modelo.
* **Señal débil aislada ≠ rojo:** una sola señal débil nunca debe llevar un caso a rechazo (prueba automatizada obligatoria).
* **Equidad:** si el cambio toca motores o umbrales, reportar la tasa de falsos positivos por grupo (rural vs urbano, género, grupo étnico) y la paridad demográfica.

---

## 🧪 6. Puertas de Calidad
Todas las puertas se ejecutan en la CI de GitHub (`.github/workflows/ci.yml`) al abrir un PR a `main`, y localmente vía `pre-commit` hooks.

| Puerta | Backend | Frontend |
|---|---|---|
| Lint / formato | `uv run ruff check . && uv run ruff format --check .` | `npm run lint` (ESLint + Prettier) |
| Pruebas + cobertura | `uv run pytest` (gate ≥80%) | `npm run test:coverage` (gate ≥80%) |
| Escaneo de secretos | `gitleaks` (en CI; opcional local) | igual |
| Mensaje de commit | Conventional Commits (en inglés) | igual |
| Rama protegida | No commit directo a `main` | igual |

**Instalar hooks localmente:**
```bash
pip install pre-commit
pre-commit install
pre-commit install --hook-type commit-msg
```

---

## ⌨️ 7. Comandos Útiles

### Backend (desde `backend/`)
```bash
uv sync                                    # instalar dependencias
uv run uvicorn app.main:app --reload       # servidor de desarrollo (http://localhost:8000/docs)
uv run pytest                              # pruebas + cobertura
uv run ruff check .                        # lint
uv run ruff format .                       # formatear
```

### Frontend (desde `frontend/`)
```bash
npm install            # instalar dependencias
npm run dev            # servidor de desarrollo (http://localhost:5173)
npm run test           # pruebas
npm run test:coverage  # pruebas + cobertura
npm run lint           # ESLint + Prettier
npm run format         # formatear con Prettier
```

### Raíz
```bash
pre-commit run --all-files    # ejecutar todos los hooks sobre el repo
```
