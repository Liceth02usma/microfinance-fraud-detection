# Matriz de adquisición del conocimiento (HU-02)

**Proyecto:** Sistema inteligente de detección de fraude en microfinanzas — CrediConfianza
**Fecha de elaboración:** 2026-11-23
**Responsable:** Equipo de desarrollo (Dev 1), con revisión del auditor ético (Dev 3)
**Técnicas de adquisición:** análisis del escenario del enunciado, lista de chequeo de analistas, entrevistas simuladas (ver actas abajo).

Cada fila registra: **señal → fuente → técnica → experto/documento → fecha → nivel de confianza → explicación rural legítima** (obligatorio para señales débiles).

---

## 1. Señales débiles (13) — HU-02

Las señales débiles **no implican fraude por sí solas**; castigan a la ruralidad cuando se aplican sin contexto. Cada una trae su explicación rural legítima.

| ID | Señal | Fuente | Técnica | Experto / Documento | Fecha | Confianza | Explicación rural legítima |
|---|---|---|---|---|---|---|---|
| SW-01 | sin_historial | Escenario + analistas | Entrevista simulada A-01 | Analista de crédito (rol docente) | 2026-11-23 | Alta (0.9) | Productores que nunca accedieron al sistema financiero formal; arraigo verificable por asamblea comunitaria |
| SW-02 | vive_lejos | Escenario (35 min del corredor) | Análisis documental | Enunciado — geografía de San Juan de la Vega | 2026-11-23 | Alta (0.95) | Dispersión geográfica del minifundio andino; distancia = geografía, no riesgo |
| SW-03 | sin_local_fijo | Analistas | Entrevista simulada A-02 | Analista de crédito (rol docente) | 2026-11-23 | Alta (0.9) | La unidad productiva es la parcela o la venta en plaza dominical; no hay local comercial |
| SW-04 | sin_fiador | Escenario + analistas | Lista de chequeo | Comité de riesgo | 2026-11-23 | Media (0.8) | Garantías solidarias comunitarias sustituyen fiadores bancarios con salario certificado |
| SW-05 | cedula_otra_region | Analistas | Lista de chequeo | Oficial de crédito | 2026-11-23 | Media (0.8) | Movilidad por cosecha cafetera o retorno comunitario; cédula de otra jurisdicción es frecuente |
| SW-06 | celular_prepago | Escenario (conectividad intermitente) | Análisis documental | Enunciado — zonas rurales | 2026-11-23 | Alta (0.95) | >80 % de hogares campesinos en Valles Templados usan prepago; sin red pospago en veredas |
| SW-07 | sin_cuenta_bancaria | Escenario (fondo parroquial 1989) | Análisis documental | Historia de CrediConfianza | 2026-11-23 | Alta (0.95) | Economía no bancarizada en efectivo; misión de inclusión financiera de primer ingreso |
| SW-08 | factura_manual | Analistas | Lista de chequeo | Verificación documental | 2026-11-23 | Media (0.8) | Talonario de almacén veredal admisible para comercios sin facturación electrónica |
| SW-09 | fotos_poco_convincentes | Analistas | Entrevista simulada A-02 | Oficial de crédito de campo | 2026-11-23 | Media (0.8) | Fotos tomadas en campo con luz natural, sin estudio ni conectividad para rehacerlas |
| SW-10 | sin_referencias_comerciales | Analistas | Lista de chequeo | Comité de riesgo | 2026-11-23 | Media (0.8) | El comercio en ferias no deja referencias escritas; se usa aval de Junta de Acción Comunal |
| SW-11 | nombre_distinto_recibo | Analistas | Lista de chequeo | Verificación de servicios públicos | 2026-11-23 | Media (0.75) | Predios en sucesión familiar o aparcería: recibos a nombre de otro familiar titular |
| SW-12 | negocio_pequeno_monto | Escenario (cosecha/renovación) | Análisis documental | Enunciado — estacionalidad | 2026-11-23 | Alta (0.9) | Renovación de cafetales exige inversión inicial alta; proporción monto/ingreso refleja el ciclo agro |
| SW-13 | direccion_sin_georreferenciar | Escenario (zonas sin nomenclatura) | Análisis documental | Enunciado — catastro rural | 2026-11-23 | Alta (0.95) | Toponimia veredal sin catastro formal; direcciones descritas por referencias naturales |

## 2. Indicios fuertes (6) — HU-02

| ID | Indicio | Fuente | Técnica | Experto / Documento | Fecha | Confianza |
|---|---|---|---|---|---|---|
| SF-01 | cedula_alterada | Lista de chequeo de analistas | Entrevista simulada A-01 | Registraduría / verificación biométrica | 2026-11-23 | Alta (0.95) |
| SF-02 | ingresos_inconsistentes | Revisión del comité | Análisis documental | Matemática financiera: ventas vs. capacidad | 2026-11-23 | Alta (0.95) |
| SF-03 | factura_falsa | Verificación DIAN | Cruce de bases | NIT inexistente o empresa fantasma | 2026-11-23 | Alta (0.95) |
| SF-04 | referencias_falsas | Llamadas de referencia | Cruce de bases | Mismo teléfono en solicitudes simultáneas | 2026-11-23 | Alta (0.9) |
| SF-05 | historial_adverso | Centrales de riesgo | Cruce de bases | Listas restrictivas / SARL | 2026-11-23 | Alta (0.95) |
| SF-06 | negocio_inconsistente | Visita al negocio | Observación directa | Inspección de campo sin explotación | 2026-11-23 | Alta (0.9) |

## 3. Variables y grupos protegidos (HU-04)

| Variable | Clasificación | Uso en el modelo | Justificación |
|---|---|---|---|
| `tipo_zona` (rural/urbana) | **Sensible** | Solo auditoría (excluida del ML) | Medir FPR por zona sin usarla como predictora evita aprender el sesgo histórico |
| `genero` | **Sensible** | Solo auditoría | Paridad de crédito a mujeres rurales (R-BIAS-01) |
| `pertenencia_etnica` | **Sensible** | Solo auditoría | Grupos campesinos/indígenas/afro protegidos por política ética |
| `cedula_otra_region` (región de expedición) | **Proxy potencial** | Señal débil con tope rural | Correlaciona con migración y etnia; se usa con `tope_rural` para no penalizar |
| `oficina` | **Proxy potencial** | Solo auditoría | Oficina rural/urbana proxy de `tipo_zona` |
| `ingresos_declarados`, `monto_solicitado`, señales | **Neutral** | Sí en ML | Contenido económico/delictivo directo |

**Decisión escrita (Dev 3 + Dev 2):** las tres variables sensibles **no entran** al modelo ML (`EXCLUDED_FEATURES` en `ml_model.py`) y se usan **únicamente en la auditoría** de equidad (HU-21). Justificación: cumplir con minimización de datos y evitar aprendizaje de proxy discriminatorio; la equidad se mide y mitiga por umbrales/reponderación, no por usar la variable sensible como predictor.

## 4. Entrevistas simuladas (actas breves)

### Acta A-01 — Analista de crédito (rol asumido por docente/compañero)
- **Fecha:** 2026-11-23 · **Duración:** 30 min · **Técnica:** entrevista semi-estructurada.
- **Hallazgos:** "Lo más frecuente es que el campesino no tenga historial ni cuenta; eso no es fraude. Fraude es cédula alterada o referencias que no contestan".
- **Señales confirmadas:** SW-01, SW-04, SW-10, SF-01, SF-04.

### Acta A-02 — Oficial de crédito de campo (rol asumido por docente/compañero)
- **Fecha:** 2026-11-23 · **Duración:** 25 min · **Técnica:** recorrido de casos.
- **Hallazgos:** "Las fotos salen mal porque no hay luz en la parcela; las facturas son de talonario del almacén; el negocio 'pequeño' es una finca de 3 hectáreas que para el banco no alcanza".
- **Señales confirmadas:** SW-03, SW-08, SW-09, SW-12, SF-06.

---

> **Nota:** las entrevistas son simuladas conforme al riesgo del backlog ("no hay acceso a analistas reales") y se declara como limitación en la documentación.
