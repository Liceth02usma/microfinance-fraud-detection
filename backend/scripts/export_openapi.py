"""Vuelca el OpenAPI real de la aplicación a un archivo JSON (HU-17).

Se usa en CI para entregar el esquema al paso de generación de tipos del frontend
(`OPENAPI_PATH`), de modo que los tipos se deriven del contrato real y nunca de
un esquema inventado o vacío.

Uso:
    uv run python scripts/export_openapi.py openapi.json
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

#: Permite ejecutar el archivo directamente (`python scripts/export_openapi.py`)
#: sin instalar el paquete: añade `backend/` al sys.path.
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.main import app  # noqa: E402  (el import requiere el sys.path anterior)

#: Endpoints que deben existir para que el esquema sea útil como contrato.
REQUIRED_PATHS = ("/api/v1/evaluate",)

#: Schemas Pydantic que deben existir y no pueden estar vacíos.
REQUIRED_SCHEMAS = ("EvaluationRequest", "EvaluationResponse", "RuleActivation", "EngineStatus")


def main(argv: list[str]) -> int:
    """Escribe `app.openapi()` en el archivo indicado y valida que no esté vacío."""
    destino = Path(argv[1]) if len(argv) > 1 else Path("openapi.json")

    spec = app.openapi()
    paths = spec.get("paths", {})
    schemas = spec.get("components", {}).get("schemas", {})

    faltan_paths = [p for p in REQUIRED_PATHS if p not in paths]
    faltan_schemas = [s for s in REQUIRED_SCHEMAS if s not in schemas]
    vacios = [s for s in REQUIRED_SCHEMAS if s in schemas and not schemas[s].get("properties")]

    if faltan_paths or faltan_schemas or vacios:
        print(
            "El OpenAPI generado no es valido como contrato:"
            f" paths faltantes={faltan_paths}, schemas faltantes={faltan_schemas},"
            f" schemas vacios={vacios}",
            file=sys.stderr,
        )
        return 1

    destino.write_text(
        json.dumps(spec, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"OpenAPI exportado a {destino} ({len(paths)} rutas, {len(schemas)} schemas)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
