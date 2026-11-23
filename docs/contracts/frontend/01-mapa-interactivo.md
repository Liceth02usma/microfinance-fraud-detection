# Contrato 01 · Vista — Mapa Interactivo de Arquitectura

| | |
|---|---|
| **Versión** | 0.1.0 |
| **Estado** | Propuesto |
| **HUs cubiertas** | HU-04 (variables sensibles), HU-09 (human-in-the-loop), HU-10/HU-11 (motor de reglas), HU-17 (contrato API), HU-20 (explicabilidad) |
| **Consumidores** | Vista `Gobierno del Sistema` (`frontend/src/views/GobiernoSistema.tsx`) |
| **Pestaña** | Tab 1 de 3 (`Mapa Interactivo`) |
| **Siguiente paso** | Contrato 02 (Simulador de Inferencia) |

---

## 1. Propósito

Mostrar la arquitectura híbrida del sistema CrediConfianza como un **mapa visual interactivo** de nodos conectados por zonas lógicas. Cada nodo es clicable y abre un panel inspector lateral que expone su descripción técnica, tecnología, rol ético y un fragmento de dato o fórmula representativa.

La vista no consume la API en tiempo real (sus datos son estáticos y versionados junto al código). Opcionalmente lee `engine_status` del último resultado de evaluación, si está disponible en contexto, para indicar si un motor está `ok` o `missing`.

---

## 2. Fuente de datos

| Dato | Origen | Notas |
|---|---|---|
| Nodos, descripciones, fórmulas | Datos estáticos en el frontend (`src/data/arquitectura.ts`) | No requiere llamada API |
| Estado de motores (`ok`/`missing`) | `engine_status` del último `EvaluationResponse` en contexto, si existe | Opcional; si no hay, todos se muestran como `—` |
| Versión del modelo | `model_version` del último `EvaluationResponse` | Se muestra en el pie de cada motor |

---

## 3. Layout y zonas del mapa

La vista se divide en **dos columnas**: el lienzo principal (8/12 columnas) y el panel inspector (4/12 columnas, fijo al hacer scroll).

### 3.1 Lienzo principal — tres zonas

#### Zona A · Entorno de Usuario (borde azul)

Contiene dos nodos:

| ID nodo | Nombre | Descripción breve | Ícono sugerido |
|---|---|---|---|
| `nodo-originacion` | Interfaz de Originación | Formulario urbano/rural que captura los 19 campos del `EvaluationRequest`; lanza `POST /api/v1/evaluate`. Respuesta < 3 s (HU-17). | `fa-file-invoice` |
| `nodo-explicabilidad` | Subsistema de Explicabilidad | Muestra los `explanatory_factors` (≥ 3, HU-20), el desglose SHAP, pesos bayesianos y reglas activadas. | `fa-magnifying-glass-chart` |

#### Zona B · Núcleo Híbrido (borde púrpura, resplandor)

Contiene un nodo central de fusión y tres nodos hijos:

| ID nodo | Nombre | Descripción breve | Ícono sugerido |
|---|---|---|---|
| `nodo-hibrido` | Motor Híbrido (Fusión) | Combina sub-puntajes de los tres motores en un puntaje unificado 0–100 y la clasificación `verde`/`amarillo`/`rojo`. Pesos configurables. | `fa-code-merge` |
| `nodo-reglas` | Motor de Reglas | 20–30 reglas YAML/JSON con ID, condición, peso, justificación y categoría (fuerte/débil). Señales débiles tienen condición de contexto rural (HU-11). Recarga sin reinicio. | `fa-list-check` |
| `nodo-bayesiano` | Red Bayesiana (pgmpy) | Modela P(Fraude \| evidencia). Inferencia < 1 s. Nodos: zona, historial, tipo_negocio, señales débiles agregadas, fraude. Parámetros documentados en código (HU-20). | `fa-share-nodes` |
| `nodo-ml` | Modelo ML (XGBoost + SHAP) | Clasificador supervisado entrenado con dataset sintético estratificado (2–5 % fraude). SHAP valores para explicabilidad por instancia. | `fa-brain` |

Conector visual entre Zona A y Zona B: etiqueta `Solicitud → Evaluación / Score + Factores ↑`.

#### Zona C · Conocimiento y Ética (borde verde esmeralda)

| ID nodo | Nombre | Descripción breve | Ícono sugerido |
|---|---|---|---|
| `nodo-base-conocimiento` | Base de Conocimientos | Reglas YAML validadas por esquema en `/knowledge`. Categorías: fuerte/débil. 13 señales débiles + 6 indicadores fuertes (HU-02). | `fa-book-bookmark` |
| `nodo-etica` | Módulo de Ética y Equidad | Calcula FPR por grupo (zona, género, pertenencia étnica). Reporte de paridad demográfica + Equalized Odds con `fairlearn`. Sugiere umbrales equitativos (HU-04). | `fa-scale-balanced` |
| `nodo-dataset` | Dataset Sintético | Registros anonimizados, semilla fija, 2–5 % fraude. Split estratificado por fraude × zona. Campo `tipo_zona` (urbana/rural) obligatorio. | `fa-table` |

Conector visual entre Zona B y Zona C: etiqueta `Reglas ← Actualización / Auditoría ↑`.

---

### 3.2 Panel inspector lateral

Cuando el usuario hace clic en un nodo, el panel muestra:

| Elemento | Descripción |
|---|---|
| **Badge de categoría** | Color según zona (azul = Usuario, púrpura = Núcleo, verde = Conocimiento) |
| **Título** | Nombre del nodo |
| **Descripción** | Párrafo de 2–4 oraciones explicando función y propósito |
| **Características clave** | Lista de 3–5 items (tecnología, constraintía, referencia a HU) |
| **Fragmento representativo** | Bloque de código o fórmula (p. ej. una regla YAML, la ecuación de fusión, una salida SHAP ejemplo) |
| **Estado del motor** | Badge `ok` (verde) o `missing` (ámbar) si aplica al nodo |

Estado inicial del inspector (sin nodo seleccionado): mensaje `Haz clic en cualquier módulo del diagrama para explorar sus especificaciones.` con ícono animado.

---

## 4. Interacciones

| Acción | Resultado |
|---|---|
| Clic en nodo | El nodo adquiere borde resaltado (`node-active`); el inspector muestra sus datos |
| Clic en otro nodo | El anterior vuelve al estado normal; el nuevo se resalta |
| Clic en el mismo nodo activo | El nodo vuelve al estado normal; el inspector muestra el estado vacío |
| Hover en nodo | El card sube 3 px (`translateY(-3px)`) y gana sombra de color según zona |
| Scroll | El panel inspector permanece visible (`sticky top-20`) |

---

## 5. Estados de interfaz

| Estado | Qué se muestra |
|---|---|
| **Inicial** | Mapa completo, inspector en modo vacío |
| **Nodo seleccionado** | Mapa completo + inspector con datos del nodo |
| **Motor missing** (si hay contexto) | Badge `MISSING` ámbar en el nodo del motor afectado y en el inspector |
| **Sin contexto de evaluación** | Badges de motor ocultos o marcados como `—` |

---

## 6. Criterios de verificación

**Estructura:**
- El mapa contiene exactamente 9 nodos distribuidos en las 3 zonas.
- Cada nodo tiene ID, nombre, descripción (≥ 2 oraciones), lista de características (3–5 items) y fragmento representativo.
- Los conectores entre zonas tienen etiqueta visible.

**Interacción:**
- Hacer clic en cada nodo actualiza el inspector con los datos correctos.
- Hacer clic en el mismo nodo dos veces regresa al inspector al estado vacío.
- El panel inspector no hace scroll independiente del lienzo.

**Ética (HU-11, HU-18):**
- El nodo `nodo-etica` muestra en su fragmento representativo las variables protegidas y su clasificación (sensible / proxy potencial / neutral).
- El nodo `nodo-reglas` menciona explícitamente la condición de contexto rural en las señales débiles.

**Accesibilidad:**
- Cada nodo tiene atributo `role="button"` y `aria-label` descriptivo.
- El contraste de texto sobre fondo es ≥ 4.5:1.

---

## 7. Datos estáticos — fragmentos representativos por nodo

Los fragmentos que aparecen en el inspector están hardcodeados en `src/data/arquitectura.ts`.

### `nodo-reglas` — Ejemplo de regla YAML

```yaml
- id: "R-WEAK-SIN-HISTORIAL"
  condicion: "sin_historial == true AND tipo_zona != 'rural'"
  peso: 0.15
  justificacion: "Sin historial crediticio fuera de zona rural; en zona rural es frecuente por exclusión histórica del sistema financiero formal."
  categoria: "debil"
  fuente: "analistas_crediconfianza_2024"
```

### `nodo-bayesiano` — Ecuación de inferencia

```
P(Fraude | sin_cuenta, vive_lejos, plaza) =
  P(Fraude) · P(sin_cuenta|Fraude) · P(vive_lejos|Fraude) · P(plaza|Fraude)
  ──────────────────────────────────────────────────────────────────────────
                           P(evidencia)
Implementación: pgmpy · VariableElimination
```

### `nodo-hibrido` — Fórmula de fusión

```
score_final = w_reglas · score_reglas
            + w_bayes  · P(Fraude|evidencia) · 100
            + w_ml     · P_ml · 100

Pesos por defecto (configurables):
  w_reglas = 0.35 · w_bayes = 0.30 · w_ml = 0.35

Clasificación:
  score < 30  → verde  (aprobar)
  30 ≤ score < 60 → amarillo (revisión manual)
  score ≥ 60  → rojo   (rechazar / alerta)
```

### `nodo-etica` — Variables protegidas

```
Variable            | Clasificación      | Uso modelo | Uso auditoría
────────────────────|────────────────────|────────────|──────────────
tipo_zona           | proxy potencial    | No         | Sí (FPR rural vs urbana)
genero              | sensible           | No         | Sí (FPR por género)
pertenencia_etnica  | sensible           | No         | Sí (FPR campesino/indígena/afro)
es_estacional       | proxy potencial    | Sí (neutro)| Sí
```
