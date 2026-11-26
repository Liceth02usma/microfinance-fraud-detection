"""Reportes PDF de valoraciones de clientes (HU-09, HU-20, HU-26).

Dos formatos:
- `render_valuation_pdf`: ficha de una valoración (cliente, decisión del
  analista, recomendación del sistema, motores, factores y reglas activadas).
- `render_valuations_report_pdf`: listado consolidado del historial.

Se usa ReportLab (sin dependencias del sistema). Los factores explicativos
vienen con `<strong>` del backend; ReportLab entiende `<b>`, así que se
convierten en lugar de mostrarse como texto crudo.
"""

from __future__ import annotations

import re
from datetime import datetime
from io import BytesIO
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from app.schemas.valuations import AnalystDecision, ValuationRecord

BRAND = colors.HexColor("#0F5132")
MUTED = colors.HexColor("#5F6B66")
LINE = colors.HexColor("#D5DDD9")
SEMAFORO_COLORS = {
    "verde": colors.HexColor("#1E7B4C"),
    "amarillo": colors.HexColor("#B7791F"),
    "rojo": colors.HexColor("#B42318"),
}
SEMAFORO_LABELS = {"verde": "Verde", "amarillo": "Amarillo", "rojo": "Rojo"}
PRODUCT_LABELS = {
    "agropecuario": "Agropecuario",
    "microempresa": "Microempresa",
    "consumo": "Consumo",
    "vivienda": "Vivienda",
}
BUSINESS_LABELS = {
    "parcela_finca": "Parcela o finca",
    "plaza_mercado_feria": "Plaza de mercado o feria",
    "local_fijo": "Local fijo",
    "servicios_domicilio": "Servicios a domicilio",
}
DECISION_LABELS = {
    AnalystDecision.APROBAR: "Aprobar",
    AnalystDecision.REVISION_COMITE: "Enviar a comité",
    AnalystDecision.RECHAZAR: "Rechazar",
}

WEAK_LABELS = {
    "sin_historial": "Sin historial crediticio",
    "vive_lejos": "Vive lejos de la oficina",
    "sin_local_fijo": "Sin local fijo",
    "sin_fiador": "Sin fiador",
    "cedula_otra_region": "Cédula de otra región",
    "celular_prepago": "Celular prepago",
    "sin_cuenta_bancaria": "Sin cuenta bancaria",
    "factura_manual": "Factura manual",
    "fotos_poco_convincentes": "Fotos poco convincentes",
    "sin_referencias_comerciales": "Sin referencias comerciales",
    "nombre_distinto_recibo": "Nombre distinto al del recibo",
    "negocio_pequeno_monto": "Negocio pequeño para el monto",
    "direccion_sin_georreferenciar": "Dirección sin georreferenciar",
}
STRONG_LABELS = {
    "cedula_alterada": "Cédula alterada",
    "ingresos_inconsistentes": "Ingresos inconsistentes",
    "factura_falsa": "Factura falsa",
    "referencias_falsas": "Referencias falsas",
    "historial_adverso": "Historial adverso",
    "negocio_inconsistente": "Negocio inconsistente",
}


def _styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "title", parent=base["Title"], fontSize=16, textColor=BRAND, alignment=0, spaceAfter=2
        ),
        "subtitle": ParagraphStyle("subtitle", parent=base["Normal"], fontSize=9, textColor=MUTED),
        "h2": ParagraphStyle(
            "h2",
            parent=base["Heading2"],
            fontSize=11.5,
            textColor=BRAND,
            spaceBefore=10,
            keepWithNext=1,
        ),
        "body": ParagraphStyle("body", parent=base["Normal"], fontSize=9.5, leading=13),
        "small": ParagraphStyle(
            "small", parent=base["Normal"], fontSize=8, leading=10.5, textColor=MUTED
        ),
        "cell": ParagraphStyle("cell", parent=base["Normal"], fontSize=8.5, leading=11),
    }


def _money(value: float) -> str:
    return "$ " + f"{value:,.0f}".replace(",", ".")


def _date(iso: str) -> str:
    try:
        return datetime.fromisoformat(iso).strftime("%d/%m/%Y %H:%M UTC")
    except ValueError:
        return iso


def _rich(text: str) -> str:
    """Escapa el texto y conserva solo las negritas que manda el backend."""
    plain = re.sub(r"</?strong>", "\x00", text)
    parts = escape(plain).split("\x00")
    out = ""
    for i, part in enumerate(parts):
        out += part
        if i < len(parts) - 1:
            out += "<b>" if i % 2 == 0 else "</b>"
    return out


def _kv_table(rows: list[tuple[str, str]], styles: dict[str, ParagraphStyle]) -> Table:
    data = [
        [Paragraph(f"<b>{escape(k)}</b>", styles["cell"]), Paragraph(v, styles["cell"])]
        for k, v in rows
    ]
    table = Table(data, colWidths=[5 * cm, 12 * cm])
    table.setStyle(
        TableStyle(
            [
                ("LINEBELOW", (0, 0), (-1, -1), 0.4, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    return table


def _footer(canvas, doc) -> None:  # type: ignore[no-untyped-def]
    canvas.saveState()
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(
        doc.leftMargin,
        1.2 * cm,
        "CrediConfianza · Prototipo académico con datos sintéticos. El sistema recomienda; "
        "la decisión es del analista.",
    )
    canvas.drawRightString(doc.pagesize[0] - doc.rightMargin, 1.2 * cm, f"Página {doc.page}")
    canvas.restoreState()


def render_valuation_pdf(record: ValuationRecord) -> bytes:
    """Ficha PDF de una valoración."""
    styles = _styles()
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
        topMargin=1.8 * cm,
        bottomMargin=2 * cm,
        title=f"Valoración #{record.id} — {record.cliente_nombre}",
        author="CrediConfianza",
    )
    sol = record.solicitud
    res = record.resultado
    sem = res.semaforo.value
    sem_color = SEMAFORO_COLORS[sem].hexval()[2:]

    story: list = [
        Paragraph("CrediConfianza · Valoración de riesgo de fraude", styles["title"]),
        Paragraph(
            f"Valoración #{record.id} · {_date(record.created_at)} · Analista: "
            f"{escape(record.analista)}",
            styles["subtitle"],
        ),
        Spacer(1, 8),
    ]

    # Resumen: recomendación vs decisión
    seguimiento = (
        "Coincide con la recomendación del sistema."
        if record.sigue_recomendacion
        else "El analista se apartó de la recomendación del sistema."
    )
    summary = Table(
        [
            [
                Paragraph(
                    f"<font size=8 color='#5F6B66'>RECOMENDACIÓN DEL SISTEMA</font><br/>"
                    f"<font size=15 color='#{sem_color}'><b>{SEMAFORO_LABELS[sem]}</b></font>"
                    f"<br/>Puntaje de riesgo: <b>{res.risk_score:.1f}</b> / 100",
                    styles["body"],
                ),
                Paragraph(
                    f"<font size=8 color='#5F6B66'>DECISIÓN DEL ANALISTA</font><br/>"
                    f"<font size=15><b>{DECISION_LABELS[record.decision]}</b></font>"
                    f"<br/>{seguimiento}",
                    styles["body"],
                ),
            ]
        ],
        colWidths=[8.5 * cm, 8.5 * cm],
    )
    summary.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.6, LINE),
                ("INNERGRID", (0, 0), (-1, -1), 0.6, LINE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    story += [summary, Spacer(1, 4)]

    story.append(Paragraph("Cliente y solicitud", styles["h2"]))
    story.append(
        _kv_table(
            [
                ("Cliente", escape(record.cliente_nombre)),
                ("Documento / código", escape(record.cliente_documento)),
                ("Zona", sol.tipo_zona.value.capitalize()),
                ("Producto", PRODUCT_LABELS[sol.producto_credito.value]),
                ("Tipo de negocio", BUSINESS_LABELS[sol.tipo_negocio.value]),
                ("Monto solicitado", _money(sol.monto_solicitado)),
                ("Ingresos declarados", _money(sol.ingresos_declarados)),
                ("Plazo", f"{sol.plazo_meses} meses"),
                ("Negocio estacional", "Sí" if sol.es_estacional else "No"),
            ],
            styles,
        )
    )

    story.append(Paragraph("Motivo de la decisión", styles["h2"]))
    story.append(Paragraph(escape(record.motivo), styles["body"]))
    if record.observaciones:
        story.append(Spacer(1, 4))
        story.append(
            Paragraph(f"<b>Observaciones:</b> {escape(record.observaciones)}", styles["body"])
        )

    weak = [label for name, label in WEAK_LABELS.items() if getattr(sol, name)]
    strong = [label for name, label in STRONG_LABELS.items() if getattr(sol, name)]
    story.append(Paragraph("Señales observadas", styles["h2"]))
    story.append(
        _kv_table(
            [
                (
                    f"Indicios fuertes ({len(strong)})",
                    escape(", ".join(strong)) if strong else "Ninguno",
                ),
                (
                    f"Señales débiles ({len(weak)})",
                    escape(", ".join(weak)) if weak else "Ninguna",
                ),
            ],
            styles,
        )
    )

    story.append(Paragraph("Aporte de cada motor", styles["h2"]))
    story.append(
        _kv_table(
            [
                ("Reglas expertas (subpuntaje)", f"{res.rules_subscore:.2f} de 1,00"),
                ("Red bayesiana · P(fraude)", f"{res.bayesian_probability * 100:.2f} %"),
                ("Modelo ML · probabilidad", f"{res.ml_probability * 100:.2f} %"),
            ],
            styles,
        )
    )

    story.append(Paragraph("Factores explicativos", styles["h2"]))
    for factor in res.explanatory_factors:
        story.append(Paragraph(f"• {_rich(factor)}", styles["body"]))

    if res.activated_rules:
        story.append(Paragraph("Reglas activadas", styles["h2"]))
        rows = [["Regla", "Peso", "Justificación"]] + [
            [
                r.id_regla,
                f"{r.peso:+.2f}",
                Paragraph(escape(r.justificacion), styles["cell"]),
            ]
            for r in res.activated_rules
        ]
        table = Table(rows, colWidths=[2.6 * cm, 1.6 * cm, 12.8 * cm], repeatRows=1)
        table.setStyle(
            TableStyle(
                [
                    ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("TEXTCOLOR", (0, 0), (-1, 0), BRAND),
                    ("LINEBELOW", (0, 0), (-1, -1), 0.4, LINE),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ]
            )
        )
        story.append(table)

    story.append(Spacer(1, 10))
    story.append(
        Paragraph(
            f"Trazabilidad: {escape(record.version_sistema)} · solicitud "
            f"{escape(sol.id_solicitud)}",
            styles["small"],
        )
    )

    doc.build(story, onFirstPage=_footer, onLaterPages=_footer)
    return buffer.getvalue()


def render_valuations_report_pdf(records: list[ValuationRecord]) -> bytes:
    """Listado consolidado del historial de valoraciones."""
    styles = _styles()
    buffer = BytesIO()
    page = landscape(A4)
    doc = SimpleDocTemplate(
        buffer,
        pagesize=page,
        leftMargin=1.5 * cm,
        rightMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=2 * cm,
        title="Historial de valoraciones — CrediConfianza",
        author="CrediConfianza",
    )
    total = len(records)
    discrepancias = sum(1 for r in records if not r.sigue_recomendacion)
    story: list = [
        Paragraph("CrediConfianza · Historial de valoraciones", styles["title"]),
        Paragraph(
            f"Generado el {datetime.now().strftime('%d/%m/%Y %H:%M')} · {total} valoraciones · "
            f"{discrepancias} decisiones distintas a la recomendación del sistema",
            styles["subtitle"],
        ),
        Spacer(1, 10),
    ]
    if not records:
        story.append(Paragraph("Todavía no hay valoraciones guardadas.", styles["body"]))
    else:
        header = [
            "#",
            "Fecha",
            "Cliente",
            "Documento",
            "Zona",
            "Monto",
            "Puntaje",
            "Semáforo",
            "Decisión",
            "Analista",
            "Motivo",
        ]
        rows: list[list] = [header]
        for r in records:
            rows.append(
                [
                    str(r.id),
                    _date(r.created_at)[:10],
                    Paragraph(escape(r.cliente_nombre), styles["cell"]),
                    escape(r.cliente_documento),
                    r.tipo_zona.capitalize(),
                    _money(r.monto_solicitado),
                    f"{r.risk_score:.1f}",
                    SEMAFORO_LABELS[r.semaforo.value],
                    DECISION_LABELS[r.decision] + ("" if r.sigue_recomendacion else " *"),
                    Paragraph(escape(r.analista), styles["cell"]),
                    Paragraph(escape(r.motivo[:160]), styles["cell"]),
                ]
            )
        widths = [0.9, 2.0, 3.6, 2.4, 1.6, 2.6, 1.5, 1.9, 2.6, 2.6, 5.0]
        table = Table(rows, colWidths=[w * cm for w in widths], repeatRows=1)
        style = [
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("TEXTCOLOR", (0, 0), (-1, 0), BRAND),
            ("LINEBELOW", (0, 0), (-1, -1), 0.4, LINE),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]
        for i, r in enumerate(records, start=1):
            style.append(("TEXTCOLOR", (7, i), (7, i), SEMAFORO_COLORS[r.semaforo.value]))
        table.setStyle(TableStyle(style))
        story.append(table)
        story.append(Spacer(1, 6))
        story.append(
            Paragraph(
                "* La decisión del analista difiere de la recomendación del semáforo "
                "(verde → aprobar, amarillo → comité, rojo → rechazar).",
                styles["small"],
            )
        )
    doc.build(story, onFirstPage=_footer, onLaterPages=_footer)
    return buffer.getvalue()
