"""Persistencia de valoraciones de clientes en SQLite (HU-09, HU-26).

Se usa SQLite de la librería estándar: no requiere servidor y el archivo
queda junto a los datos del prototipo. La ruta se configura con la variable
de entorno `VALUATIONS_DB` (las pruebas usan un archivo temporal).

La recomendación del sistema se **recalcula en el servidor** al guardar, de
modo que nadie puede registrar un puntaje distinto al que produjo el motor.
"""

from __future__ import annotations

import os
import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

from app.schemas.evaluation import EvaluationRequest, EvaluationResponse, Semaforo
from app.schemas.valuations import (
    RECOMMENDED_DECISION,
    AnalystDecision,
    ValuationCreate,
    ValuationList,
    ValuationRecord,
    ValuationSummary,
)

DEFAULT_DB_PATH = Path(__file__).resolve().parents[3] / "data" / "valuations.sqlite3"

_SCHEMA = """
CREATE TABLE IF NOT EXISTS valuations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    cliente_nombre TEXT NOT NULL,
    cliente_documento TEXT NOT NULL,
    analista TEXT NOT NULL,
    decision TEXT NOT NULL,
    motivo TEXT NOT NULL,
    observaciones TEXT,
    tipo_zona TEXT NOT NULL,
    monto_solicitado REAL NOT NULL,
    risk_score REAL NOT NULL,
    semaforo TEXT NOT NULL,
    solicitud_json TEXT NOT NULL,
    resultado_json TEXT NOT NULL,
    version_sistema TEXT NOT NULL
)
"""


def db_path() -> Path:
    """Ruta del archivo SQLite: env `VALUATIONS_DB` o `<repo>/data/valuations.sqlite3`."""
    env = os.environ.get("VALUATIONS_DB")
    return Path(env) if env else DEFAULT_DB_PATH


@contextmanager
def _connect() -> Iterator[sqlite3.Connection]:
    path = db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    try:
        conn.execute(_SCHEMA)
        yield conn
        conn.commit()
    finally:
        conn.close()


def _summary(row: sqlite3.Row) -> ValuationSummary:
    semaforo = Semaforo(row["semaforo"])
    decision = AnalystDecision(row["decision"])
    return ValuationSummary(
        id=int(row["id"]),
        created_at=str(row["created_at"]),
        cliente_nombre=str(row["cliente_nombre"]),
        cliente_documento=str(row["cliente_documento"]),
        analista=str(row["analista"]),
        tipo_zona=str(row["tipo_zona"]),
        monto_solicitado=float(row["monto_solicitado"]),
        risk_score=float(row["risk_score"]),
        semaforo=semaforo,
        decision=decision,
        sigue_recomendacion=RECOMMENDED_DECISION[semaforo] == decision,
    )


def _record(row: sqlite3.Row) -> ValuationRecord:
    summary = _summary(row)
    return ValuationRecord(
        **summary.model_dump(),
        motivo=str(row["motivo"]),
        observaciones=row["observaciones"],
        solicitud=EvaluationRequest.model_validate_json(row["solicitud_json"]),
        resultado=EvaluationResponse.model_validate_json(row["resultado_json"]),
        version_sistema=str(row["version_sistema"]),
    )


def save_valuation(
    data: ValuationCreate,
    resultado: EvaluationResponse,
    version_sistema: str,
) -> ValuationRecord:
    """Inserta una valoración y la devuelve completa."""
    created_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    with _connect() as conn:
        cursor = conn.execute(
            """
            INSERT INTO valuations (
                created_at, cliente_nombre, cliente_documento, analista, decision,
                motivo, observaciones, tipo_zona, monto_solicitado, risk_score,
                semaforo, solicitud_json, resultado_json, version_sistema
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                created_at,
                data.cliente_nombre.strip(),
                data.cliente_documento.strip(),
                data.analista.strip(),
                data.decision.value,
                data.motivo.strip(),
                (data.observaciones or "").strip() or None,
                data.solicitud.tipo_zona.value,
                data.solicitud.monto_solicitado,
                resultado.risk_score,
                resultado.semaforo.value,
                data.solicitud.model_dump_json(),
                resultado.model_dump_json(),
                version_sistema,
            ),
        )
        new_id = int(cursor.lastrowid or 0)
        row = conn.execute("SELECT * FROM valuations WHERE id = ?", (new_id,)).fetchone()
    return _record(row)


def list_valuations(limit: int = 100, offset: int = 0, query: str | None = None) -> ValuationList:
    """Historial más reciente primero; `query` filtra por nombre, documento o analista."""
    where = ""
    params: list[object] = []
    if query:
        where = "WHERE cliente_nombre LIKE ? OR cliente_documento LIKE ? OR analista LIKE ?"
        like = f"%{query.strip()}%"
        params = [like, like, like]
    with _connect() as conn:
        total = int(conn.execute(f"SELECT COUNT(*) FROM valuations {where}", params).fetchone()[0])
        rows = conn.execute(
            f"SELECT * FROM valuations {where} ORDER BY id DESC LIMIT ? OFFSET ?",
            [*params, limit, offset],
        ).fetchall()
    return ValuationList(total=total, items=[_summary(r) for r in rows])


def get_valuation(valuation_id: int) -> ValuationRecord | None:
    """Valoración completa por id, o None si no existe."""
    with _connect() as conn:
        row = conn.execute("SELECT * FROM valuations WHERE id = ?", (valuation_id,)).fetchone()
    return _record(row) if row else None


def all_records(query: str | None = None, limit: int = 500) -> list[ValuationRecord]:
    """Valoraciones completas para el reporte consolidado en PDF."""
    summaries = list_valuations(limit=limit, query=query).items
    records = [get_valuation(s.id) for s in summaries]
    return [r for r in records if r is not None]
