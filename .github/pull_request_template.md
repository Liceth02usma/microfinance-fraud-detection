<!--
Título del PR: formato Conventional Commits (en inglés, minúsculas e imperativo).
Ejemplo: feat(backend): add hybrid risk score fusion
-->

## Resumen
<!-- Qué hace este PR y por qué, en 1 o 2 líneas. -->
- **HU vinculada:** #<!-- número de historia de usuario -->

## Cambios
<!-- Lista puntual de lo modificado. Sin excesos de detalle técnico a menos que sea crítico. -->
-

## Áreas afectadas
<!-- Marca solo lo que aplique. Detalla brevemente debajo si es estrictamente necesario. -->
### Backend
- [ ] API (Endpoints, Pydantic schemas)
- [ ] Motores (reglas, bayesiana, ML, híbrido)
- [ ] Ética / Equidad / Auditoría
- [ ] Datos sintéticos
- [ ] Dependencias / Variables de entorno

### Frontend
- [ ] Vistas (Originación, Explicabilidad, Auditoría, Gobierno)
- [ ] Componentes / hooks
- [ ] Cliente API
- [ ] Dependencias / Variables de entorno

### Infra / Docs
- [ ] CI / hooks / plantillas
- [ ] Documentación (`docs/`, `README.md`, `AGENTS.md`)
- [ ] Reglas / ontología (`knowledge/`)

## Cambios incompatibles
<!-- ¿Rompe algo con la versión anterior? Si no, dejar en "Ninguno". -->
Ninguno

## Checklist de verificación
- [ ] Rama con convención `{accion}/{HU}` (ej. `feature/HU17-servicio-fastapi`)
- [ ] Commit messages en inglés (Conventional Commits)
- [ ] Docstrings y comentarios en **español**
- [ ] Código, identificadores y nombres en **inglés**
- [ ] Backend: `uv run ruff check . && uv run ruff format --check .` pasa
- [ ] Backend: `uv run pytest` pasa con cobertura **≥ 80%**
- [ ] Frontend: `npm run lint` pasa
- [ ] Frontend: `npm run test:coverage` pasa con cobertura **≥ 80%**
- [ ] Ninguna decisión final automática en el backend (el sistema recomienda, la persona decide)
- [ ] Ninguna credencial / `.env` subida (gitleaks + `.gitignore` lo bloquean)
- [ ] Si toca ética/equidad: se reporta FPR por grupo y paridad

## Notas adicionales
<!-- Opcional: contexto clave para agilizar la revisión o decisiones puntuales. -->
