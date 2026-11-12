# Contrato 02 · Vista — Simulador de Inferencia

| | |
|---|---|
| **Versión** | 0.1.0 |
| **Estado** | Propuesto |
| **HUs cubiertas** | HU-02 (señales), HU-09 (human-in-the-loop), HU-10 (motor reglas), HU-17 (contrato API), HU-18 (señal débil sola ≠ rojo), HU-20 (explicabilidad), HU-25 (mocks), HU-27 (casos de referencia) |
| **Consumidores** | Vista `Gobierno del Sistema` (`frontend/src/views/GobiernoSistema.tsx`) |
| **Proveedor** | `POST /api/v1/evaluate` |
| **Pestaña** | Tab 2 de 3 (`Simulador de Inferencia`) |
| **Siguiente paso** | Contrato 03 (Componentes y Roles) |

---

## 1. Propósito

Demostrar de forma interactiva cómo el motor híbrido evalúa un solicitante. El analista o estudiante selecciona señales mediante checkboxes y configura parámetros básicos; al presionar **«Evaluar Solicitud»** la vista llama a `POST /api/v1/evaluate` y presenta el razonamiento completo: reglas activadas, probabilidades bayesiana y ML, puntaje de riesgo y factores explicativos.

La vista no reemplaza la vista de Originación (HU-01); es una herramienta de demostración y auditoría del motor.

---

## 2. `POST /api/v1/evaluate`

| | |
|---|---|
| **Entrada** | `application/json` · `EvaluationRequest` (contrato HU-17) |
| **200** | `EvaluationResponse` con puntaje, semáforo, reglas, probabilidades, factores y `engine_status` |
| **Errores** | 422 (validación), 503 (motor no disponible) |
| **Tiempo máximo** | 3 s (HU-17); el botón muestra spinner mientras espera |

### 2.1 Campos que el simulador envía

El simulador construye el `EvaluationRequest` con los valores del formulario. Los campos fijos en esta vista:

| Campo | Valor fijo | Razón |
|---|---|---|
| `id_solicitud` | `"SIM-" + timestamp` generado en cliente | Identifica la sesión de simulación |
| `modelo_version` | `"0.1.0-baseline"` | Versión actual del motor |
| `fuente_datos` | `"test"` | Origen de demostración |

Los campos controlables por el usuario en esta vista:

| Sección del formulario | Campos |
|---|---|
| **Perfil básico** | `tipo_zona`, `genero`, `pertenencia_etnica`, `producto_credito`, `tipo_negocio`, `es_estacional` |
| **Montos** | `monto_solicitado` (slider 1 M–50 M COP), `plazo_meses` (12–120), `ingresos_declarados` (slider 500 k–20 M COP), `edad_solicitante` (18–80) |
| **13 señales débiles** | `sin_historial`, `vive_lejos`, `sin_local_fijo`, `sin_fiador`, `cedula_otra_region`, `celular_prepago`, `sin_cuenta_bancaria`, `factura_manual`, `fotos_poco_convincentes`, `sin_referencias_comerciales`, `nombre_distinto_recibo`, `negocio_pequeno_monto`, `direccion_sin_georreferenciar` |
| **6 indicadores fuertes** | `cedula_alterada`, `ingresos_inconsistentes`, `factura_falsa`, `referencias_falsas`, `historial_adverso`, `negocio_inconsistente` |

El campo `oficina` se deduce automáticamente de `tipo_zona`: `"Simulador Rural"` o `"Simulador Urbano"`.

### 2.2 Respuesta 200 — campos mostrados

```json
{
  "risk_score": 12,
  "semaforo": "verde",
  "activated_rules": [
    { "id_regla": "R-WEAK-SIN-HISTORIAL", "peso": 0.15, "justificacion": "..." }
  ],
  "bayesian_probability": 0.08,
  "ml_probability": 0.05,
  "explanatory_factors": [
    "Caso rural con 8 señales débiles: no implica fraude (HU-18).",
    "Sin indicadores fuertes de fraude detectados.",
    "El sistema recomienda; la decisión final es del analista (HU-09)."
  ],
  "model_version": "0.1.0-baseline",
  "engine_status": { "rules": "ok", "bayesian": "ok", "ml": "ok" }
}
```

### 2.3 Errores

| HTTP | Qué hace el frontend |
|---|---|
| 422 | Muestra detalle de validación junto a los campos afectados (conserva los valores digitados) |
| 503 | Banner de error no bloqueante: «El servicio de evaluación no está disponible. Intenta de nuevo.» |
| Red caída | Mismo banner que 503 |

---

## 3. Layout — tres columnas

```
┌────────────────────────┬────────────────────────┬────────────────────────┐
│  Col 1 · Señales       │  Col 2 · Reglas activas│  Col 3 · Resultado     │
│  (Entrada)             │  (Razonamiento)        │  (Veredicto)           │
└────────────────────────┴────────────────────────┴────────────────────────┘
```

### 3.1 Columna 1 — Señales del Solicitante

**Selector de zona** (toggle `urbana` / `rural`) en la parte superior, con texto de ayuda:

> *Zona rural: productores con efectivo, parcelas, ingresos estacionales. Las señales débiles en este contexto no implican fraude (HU-18).*

**Perfil básico**: campos `genero`, `pertenencia_etnica`, `producto_credito`, `tipo_negocio`, `es_estacional` como selects/checkboxes compactos.

**Montos**: sliders con valor numérico visible.

**13 señales débiles**: checkboxes con etiqueta en español (misma redacción de HU-02). Cada label incluye una pastilla `débil` en color ámbar. Al pasar el cursor sobre cada señal aparece un tooltip con el contexto rural que la justifica (p. ej. *"En zona rural es frecuente: no implica fraude por sí sola"*).

**6 indicadores fuertes**: checkboxes separados visualmente con borde rojo. Cada label incluye pastilla `fuerte` en color rojo. Al pasar el cursor: *"Señal directa de fraude; una sola puede activar una alerta amarilla."*

**Contador visible** mientras el usuario marca:
- `N débiles seleccionadas · M fuertes seleccionadas`
- Advertencia cuando M ≥ 2: *«⚠ Dos o más indicadores fuertes activan alerta roja.»*
- Aviso ético cuando M = 0 y N ≥ 5: *«ℹ Solo señales débiles — el sistema protege a solicitantes rurales legítimos (HU-18).»*

**Botón «Evaluar Solicitud»**: ancho completo, degradado cian → púrpura, deshabilitado mientras la petición está en vuelo.

Carga rápida de escenarios predefinidos (tres botones pequeños):
- **Rural legítimo** — carga los valores del caso de referencia 1 (HU-27).
- **Urbano fraudulento** — carga los valores del caso de referencia 2 (HU-27).
- **Ambiguo** — carga los valores del caso de referencia 3 (HU-27).

### 3.2 Columna 2 — Reglas Activadas

**Estado antes de evaluar**: lista de las 20–30 reglas de la base de conocimientos en modo inactivo (texto gris, fondo oscuro). Formato: `[ID] SI <condición> ENTONCES <consecuencia> (peso: X.XX)`.

**Estado después de evaluar**: las reglas de `activated_rules` se resaltan con borde de color (rojo para indicadores fuertes, ámbar para débiles). Las reglas no activadas se atenúan (opacidad 40 %). Para cada regla activada se muestra su `justificacion`.

Si `engine_status.rules === "missing"`: banner ámbar «Motor de reglas no disponible en este momento».

Número de reglas activadas: `Reglas disparadas: N de 30`.

### 3.3 Columna 3 — Resultado y Traza de Razonamiento

**Estado antes de evaluar**: mensaje `// Esperando señales para iniciar la evaluación...` en fuente monoespaciada.

**Estado durante la petición** (< 3 s): spinner + texto `Evaluando con motor híbrido...`.

**Estado después de evaluar**:

#### Semáforo + Puntaje

Visualización prominente:
- Círculo grande con color (`verde` #22c55e / `amarillo` #eab308 / `rojo` #ef4444).
- Número del `risk_score` (0–100) dentro del círculo.
- Texto de clasificación: `VERDE · Aprobar` / `AMARILLO · Revisión manual` / `ROJO · Rechazar / Alerta`.
- Nota obligatoria debajo: *«El sistema recomienda; la decisión final es del analista (HU-09).»*

#### Probabilidades

| Motor | Valor |
|---|---|
| Bayesiana `P(Fraude\|evidencia)` | porcentaje con dos decimales, barra de progreso |
| ML `P_ml` | porcentaje con dos decimales, barra de progreso |
| Estado de motores | badges `ok` (verde) o `missing` (ámbar) |

#### Factores Explicativos (HU-20)

Lista numerada con mínimo 3 items (garantizado por contrato). Cada factor se muestra en lenguaje natural. Los factores relacionados con señales débiles en zona rural llevan pastilla `contexto rural` en verde esmeralda.

#### Log de razonamiento (traza)

Bloque de código monoespaciado, desplazable, que muestra la secuencia de evaluación en formato técnico:

```
[REGLAS] Evaluando 30 reglas...
[REGLAS] R-WEAK-SIN-HISTORIAL: condición = TRUE (zona rural) → activada (peso 0.15)
[REGLAS] R-STRONG-CEDULA: condición = FALSE → no activada
[REGLAS] Sub-puntaje: 0.12
[BAYES]  P(Fraude|sin_cuenta=T, zona=rural) = 0.08
[ML]     Probabilidad clasificador: 0.05
[FUSION] score = 0.35·12 + 0.30·8 + 0.35·5 = 8.95 → 9/100
[RESULTADO] VERDE
```

---

## 4. Comportamiento y efectos

- El simulador no persiste datos en base de datos (cada evaluación es efímera).
- En modo mock (`VITE_USE_MOCKS=true`) la petición es interceptada por MSW con el escenario correspondiente a las señales marcadas.
- Al cargar un escenario predefinido, los checkboxes se actualizan visualmente antes de enviar.
- Los valores de los sliders y checkboxes se conservan entre evaluaciones hasta que el usuario los cambie o cargue otro escenario.
- Si el usuario cambia señales después de una evaluación, el resultado anterior se borra y el estado vuelve a «esperando».

---

## 5. Garantías de interacción (HU-18)

**Señal débil sola → nunca rojo (en mock automático):**
`resolveScenario` devuelve `"rural-legitimo"` cuando solo hay señales débiles (≥ 5) y cero indicadores fuertes. El mock no devolverá nunca `semaforo: "rojo"` en ese caso. Esta garantía debe quedar cubierta por un test automatizado.

**Semáforo amarillo para un solo indicador fuerte:**
Un único indicador fuerte devuelve `"ambiguo"` (amarillo), no rojo, reflejando el comportamiento del backend real.

---

## 6. Estados de interfaz

```
Inicial
  → (usuario marca señales / ajusta sliders)
  → Evaluando (spinner, botón deshabilitado)
  → Resultado: Verde | Amarillo | Rojo
     → (usuario modifica señales)
     → Estado borrado → Inicial
```

Error 422: formulario con mensajes por campo, sin borrar el resultado anterior.
Error 503/red: banner no bloqueante; el formulario permanece editable.

---

## 7. Criterios de verificación

**Proveedor (mock/backend):**
- Cero indicadores fuertes + ≥ 5 señales débiles → `semaforo !== "rojo"`.
- Dos o más indicadores fuertes → `semaforo === "rojo"` y `activated_rules.length ≥ 2`.
- `explanatory_factors.length ≥ 3` en todos los escenarios.

**Consumidor (vista):**
- El botón «Evaluar» está deshabilitado mientras `status === "loading"`.
- El semáforo muestra el color correcto para cada clasificación.
- La nota «El sistema recomienda; la decisión final es del analista» es siempre visible junto al resultado.
- Al cargar «Rural legítimo», los 8 checkboxes débiles se marcan y los 6 fuertes quedan desmarcados.
- El log de razonamiento aparece siempre con al menos 5 líneas de traza.
- En pantalla < 768 px las tres columnas colapsan en una pila vertical.

---

## 8. Datos de prueba (MSW)

Los tres escenarios predefinidos utilizan los mismos `SCENARIOS` de `src/mocks/scenarios.ts` (ya implementados):

| Botón | Escenario MSW | `semaforo` esperado | `risk_score` esperado |
|---|---|---|---|
| Rural legítimo | `"rural-legitimo"` | `verde` | 12 |
| Urbano fraudulento | `"urbano-fraudulento"` | `rojo` | 95 |
| Ambiguo | `"ambiguo"` | `amarillo` | 45 |

Los botones de carga de escenario deben invocar `setScenario(nombre)` antes de disparar la petición y `resetScenario()` al terminar, para no contaminar otras pruebas.
