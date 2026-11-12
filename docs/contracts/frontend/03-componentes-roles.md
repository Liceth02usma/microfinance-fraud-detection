# Contrato 03 · Vista — Componentes y Roles

| | |
|---|---|
| **Versión** | 0.1.0 |
| **Estado** | Propuesto |
| **HUs cubiertas** | HU-02 (señales), HU-04 (variables protegidas), HU-09 (human-in-the-loop), HU-10/HU-11 (motor reglas), HU-20 (explicabilidad), HU-26 (trazabilidad de decisiones) |
| **Consumidores** | Vista `Gobierno del Sistema` (`frontend/src/views/GobiernoSistema.tsx`) |
| **Pestaña** | Tab 3 de 3 (`Componentes & Roles`) |
| **Fuente de datos** | Estática — `src/data/componentes.ts` (no requiere llamada API) |
| **Siguiente paso** | Implementación de la vista principal `GobiernoSistema.tsx` |

---

## 1. Propósito

Ofrecer una **referencia técnica y ética** del sistema: qué hace cada componente, qué señales existen, cómo se clasifican las variables sensibles y qué rol tiene cada participante humano. Esta pestaña es el «manual de gobierno» del sistema en formato interactivo (HU-26), complementando los documentos en `docs/`.

No consume la API en tiempo real. Los datos son constantes en `src/data/componentes.ts` y se actualizan junto al código cuando cambia la arquitectura.

---

## 2. Fuente de datos

| Dato | Origen |
|---|---|
| Tabla de componentes del sistema | Estático — `src/data/componentes.ts` |
| 13 señales débiles + contexto rural | Estático — mismo archivo, sección `SENALES_DEBILES` |
| 6 indicadores fuertes | Estático — sección `INDICADORES_FUERTES` |
| Variables protegidas y su clasificación | Estático — sección `VARIABLES_PROTEGIDAS` |
| Roles humanos | Estático — sección `ROLES_HUMANOS` |

---

## 3. Layout — cuatro secciones apiladas

La vista no usa columnas: las cuatro secciones se apilan verticalmente dentro del contenedor de la pestaña.

---

### 3.1 Sección A — Matriz de Componentes del Sistema

**Encabezado:** `Matriz de Componentes del Sistema Híbrido`
**Subtítulo:** `Responsabilidades, tecnología e interacción de cada capa.`

Tabla con las siguientes columnas:

| Columna | Descripción |
|---|---|
| **Componente** | Nombre con ícono Font Awesome |
| **Capa** | Pastilla de color: `Usuario` (azul) / `Núcleo Híbrido` (púrpura) / `Conocimiento & Ética` (verde) |
| **Tecnología** | Stack principal (p. ej. `pgmpy`, `XGBoost + SHAP`, `YAML`, `fairlearn`) |
| **Función principal** | Una oración |
| **Interacción clave** | Con qué otro componente se comunica principalmente |

Filas de la tabla (9 componentes):

| Componente | Capa | Tecnología | Función principal | Interacción clave |
|---|---|---|---|---|
| Interfaz de Originación | Usuario | React + Vite + TypeScript | Captura los 19 campos del `EvaluationRequest` y lanza la evaluación. Respuesta < 3 s. | Llama a `POST /api/v1/evaluate` |
| Subsistema de Explicabilidad | Usuario | React + SHAP values + reglas | Muestra ≥ 3 factores explicativos en lenguaje natural, desglose de pesos y reglas activadas (HU-20). | Consume la `EvaluationResponse` |
| Motor Híbrido (Fusión) | Núcleo Híbrido | Python + FastAPI + Pydantic | Combina sub-puntajes de los tres motores en score 0–100 y semáforo verde/amarillo/rojo. | Orquesta Reglas, Bayesiano y ML |
| Motor de Reglas | Núcleo Híbrido | Python + YAML / JSON | Evalúa 20–30 reglas con condición de contexto. Recarga sin reinicio. | Lee Base de Conocimientos; devuelve reglas activadas |
| Red Bayesiana | Núcleo Híbrido | pgmpy · VariableElimination | Modela P(Fraude \| evidencia). Inferencia < 1 s. | Recibe señales del formulario; actualiza probabilidades |
| Modelo ML | Núcleo Híbrido | XGBoost / scikit-learn + SHAP | Clasificador supervisado; SHAP por instancia para explicabilidad. | Entrenado con Dataset Sintético; devuelve `ml_probability` |
| Base de Conocimientos | Conocimiento & Ética | YAML + JSON schema | Almacena 20–30 reglas validadas (ID, condición, peso, justificación, categoría fuerte/débil). | Leída por Motor de Reglas; actualizable sin código |
| Módulo de Ética y Equidad | Conocimiento & Ética | fairlearn + pandas | Calcula FPR por grupo, paridad demográfica y Equalized Odds. Sugiere umbrales equitativos. | Consume Dataset Sintético + decisiones del analista |
| Dataset Sintético | Conocimiento & Ética | pandas + numpy + Faker | Registros anonimizados, semilla fija, 2–5 % fraude, split estratificado zona × fraude. | Base de entrenamiento del Modelo ML y auditoría ética |

La tabla es de solo lectura. En pantalla < 768 px las columnas `Tecnología` e `Interacción clave` colapsan en un acordeón bajo cada fila.

---

### 3.2 Sección B — Señales de Fraude (HU-02)

**Encabezado:** `Señales de Fraude (HU-02)`
**Subtítulo:** `13 señales débiles y 6 indicadores fuertes que el motor evalúa en cada solicitud.`

Dos sub-tablas separadas visualmente:

#### B.1 — 13 Señales Débiles

Pastilla identificadora: `débil` (ámbar). Columnas:

| Columna | Descripción |
|---|---|
| **#** | Número del 1 al 13 |
| **Señal** | Nombre corto en español |
| **Campo en API** | Nombre exacto en `EvaluationRequest` |
| **Contexto rural que la justifica** | Por qué esta señal NO implica fraude en zona rural |

Filas:

| # | Señal | Campo en API | Contexto rural que la justifica |
|---|---|---|---|
| 1 | Sin historial crediticio | `sin_historial` | Muchos productores rurales nunca accedieron al sistema financiero formal; la ausencia de historial refleja exclusión histórica, no intención fraudulenta. |
| 2 | Vive lejos de la oficina | `vive_lejos` | Las parcelas y veredas están a 30–90 min de la cabecera; la distancia es una realidad geográfica, no una señal de evasión. |
| 3 | Sin local fijo | `sin_local_fijo` | El comercio en plaza o feria, el trabajo en parcela y los servicios a domicilio son formas legítimas de negocio en la ruralidad. |
| 4 | Sin fiador | `sin_fiador` | Las redes de garantía formal son escasas en comunidades rurales; la comunidad misma actúa como red de respaldo informal. |
| 5 | Cédula de otra región | `cedula_otra_region` | La movilidad migratoria de campesinos e indígenas es frecuente; la cédula puede reflejar la región de nacimiento, no la de residencia actual. |
| 6 | Celular prepago | `celular_prepago` | En zonas rurales la cobertura es limitada; el prepago es la modalidad predominante, no un indicador de anonimato. |
| 7 | Sin cuenta bancaria | `sin_cuenta_bancaria` | El efectivo sigue siendo el medio de intercambio dominante en mercados rurales y ferias agropecuarias. |
| 8 | Factura manual | `factura_manual` | Muchos negocios informales rurales emiten facturas manuscritas; la informalidad documental no equivale a falsificación. |
| 9 | Fotos poco convincentes | `fotos_poco_convincentes` | La conectividad intermitente en zonas rurales limita la calidad fotográfica; una foto borrosa no es evidencia de negocio inexistente. |
| 10 | Sin referencias comerciales | `sin_referencias_comerciales` | Las redes comerciales formales son escasas en economías de subsistencia y agricultura familiar. |
| 11 | Nombre distinto al del recibo | `nombre_distinto_recibo` | La titularidad de servicios suele recaer en un familiar mayor; el solicitante puede ser arrendatario o hijo del titular. |
| 12 | Negocio pequeño para el monto | `negocio_pequeno_monto` | El microcrédito agropecuario suele financiar ampliaciones; el tamaño actual del negocio no refleja su capacidad proyectada. |
| 13 | Dirección sin georreferenciar | `direccion_sin_georreferenciar` | Las veredas, caseríos y parcelas carecen de nomenclatura urbana; la ausencia de coordenadas refleja un déficit de infraestructura cartográfica. |

#### B.2 — 6 Indicadores Fuertes

Pastilla identificadora: `fuerte` (rojo). Columnas:

| Columna | Descripción |
|---|---|
| **#** | Número del 1 al 6 |
| **Indicador** | Nombre corto en español |
| **Campo en API** | Nombre exacto en `EvaluationRequest` |
| **Por qué es fuerte** | Evidencia directa de fraude, no dependiente del contexto |

Filas:

| # | Indicador | Campo en API | Por qué es fuerte |
|---|---|---|---|
| 1 | Cédula alterada | `cedula_alterada` | La manipulación documental es evidencia directa de identidad falsa. |
| 2 | Ingresos inconsistentes | `ingresos_inconsistentes` | La inconsistencia verificable entre ingresos declarados y actividad real indica declaración fraudulenta. |
| 3 | Factura falsa | `factura_falsa` | La falsificación de comprobantes es un indicador directo de fraude documental. |
| 4 | Referencias falsas | `referencias_falsas` | Las referencias inventadas o no verificables apuntan a construcción deliberada de un perfil falso. |
| 5 | Historial adverso | `historial_adverso` | Registros de impago o fraude previo en centrales de riesgo son evidencia objetiva de riesgo elevado. |
| 6 | Negocio inconsistente | `negocio_inconsistente` | Cuando la descripción del negocio no corresponde a la actividad real verificada, indica fraude en la solicitud. |

**Nota ética visible** sobre la tabla B.1 (recuadro verde esmeralda):

> *«Una señal débil presentada en aislamiento NUNCA debe generar una alerta roja. El sistema requiere al menos dos indicadores fuertes para clasificar un caso como rojo (HU-18).»*

---

### 3.3 Sección C — Variables Protegidas (HU-04)

**Encabezado:** `Variables Protegidas y su Clasificación Ética (HU-04)`
**Subtítulo:** `Cada variable está clasificada según su nivel de sensibilidad. Las variables sensibles no se usan como entrada del modelo; sí se usan en la auditoría ética.`

Tabla con cinco columnas:

| Variable | Tipo de dato | Clasificación | Uso en modelo | Uso en auditoría |
|---|---|---|---|---|
| `tipo_zona` (urbana/rural) | Categórica | **Proxy potencial** | No | Sí — FPR rural vs. urbana |
| `genero` (femenino/masculino/otro) | Categórica | **Sensible** | No | Sí — FPR por género |
| `pertenencia_etnica` (campesino/afrodescendiente/indígena/ninguno) | Categórica | **Sensible** | No | Sí — FPR por grupo étnico |
| `es_estacional` | Booleana | Proxy potencial | Sí (solo como contexto) | Sí |
| `monto_solicitado` | Numérica | Neutral | Sí | No |
| `ingresos_declarados` | Numérica | Neutral | Sí | No |
| `edad_solicitante` | Numérica | Proxy potencial | Sí (con monitoreo) | Sí |
| `tipo_negocio` | Categórica | Proxy potencial | Sí | Sí — distribución por tipo |
| Señales débiles (13) | Booleanas | Proxy potencial | Sí (con condición de contexto) | Sí — FPR por señal |
| Indicadores fuertes (6) | Booleanas | Neutral | Sí | Sí |

**Leyenda de clasificaciones** (pastillas de color):

- **Sensible** (rojo): Variable que identifica directamente un grupo protegido. No se usa como entrada predictiva; solo para auditoría.
- **Proxy potencial** (ámbar): Variable que puede correlacionar con un grupo protegido sin nombrarlo. Se usa con condición de contexto o solo en auditoría.
- **Neutral** (gris): Variable técnica sin correlación esperada con grupos protegidos.

---

### 3.4 Sección D — Roles Humanos en el Sistema (HU-09, HU-26)

**Encabezado:** `Roles Humanos y Responsabilidades`
**Subtítulo:** `El sistema recomienda; los humanos deciden. Cada decisión queda registrada con razón, usuario y versión del modelo (HU-26).`

Tabla con cuatro columnas:

| Rol | Responsabilidad | Decisiones que toma | HU cubierta |
|---|---|---|---|
| **Analista de Crédito** | Revisa la recomendación del sistema y toma la decisión final sobre la solicitud. | Aprobar, rechazar o solicitar más información. Debe registrar la razón de su decisión. | HU-09, HU-26 |
| **Comité de Riesgo** | Revisa casos `amarillo` escalados y casos `rojo` con solicitud de reconsideración. | Decisión final en casos complejos. Puede ajustar el umbral de semáforo temporalmente. | HU-09, HU-26 |
| **Ingeniero del Conocimiento** | Mantiene y actualiza las reglas YAML en `/knowledge`. Valida cambios contra el esquema. | Agregar, modificar o desactivar reglas sin tocar el motor (HU-10). | HU-10, HU-11 |
| **Experto en Dominio** | Provee el conocimiento sobre fraude y contexto rural. Revisa los factores explicativos. | Validar que las justificaciones de las reglas reflejen la realidad del microcrédito. | HU-02, HU-11 |
| **Auditor Ético** | Revisa periódicamente los reportes de paridad (FPR por grupo). | Proponer ajustes de umbral para garantizar equidad. Firma el reporte ético. | HU-04 |
| **Ingeniero de ML** | Entrena, evalúa y versiona el modelo. Monitorea AUC, F1, deriva del modelo. | Decidir cuándo re-entrenar. Aprobar el paso a producción de una nueva versión. | HU-04 |

**Nota sobre trazabilidad** (recuadro azul, siempre visible):

> *«Toda decisión del analista o comité queda registrada con: (1) razón textual, (2) identificador del usuario, (3) versión del modelo (`model_version`) activa al momento de la decisión. Esta información es el insumo principal de la auditoría ética (HU-26).»*

---

## 4. Interacciones

| Acción | Resultado |
|---|---|
| Hover en una fila de tabla | Fondo ligeramente resaltado (sin cambio de contenido) |
| Clic en encabezado de columna ordenable | Ordena la tabla por esa columna (ascendente/descendente). Aplica a Secciones A y B. |
| Clic en `[?]` junto a «Clasificación» en la Sección C | Muestra un tooltip/modal con la leyenda completa de clasificaciones |
| Pantalla < 768 px | Tablas con scroll horizontal; columnas secundarias colapsables |

No hay llamadas a la API desde esta pestaña.

---

## 5. Estados de interfaz

La vista solo tiene un estado: **cargada**. No hay loading, error ni vacío porque los datos son estáticos.

---

## 6. Criterios de verificación

**Estructura:**
- La Sección A contiene exactamente 9 filas (un componente por fila).
- La Sección B.1 contiene exactamente 13 filas; la Sección B.2 exactamente 6 filas.
- La nota ética de HU-18 es visible sobre la tabla de señales débiles.
- La Sección C contiene exactamente 10 filas de variables.
- La Sección D contiene exactamente 6 filas de roles.

**Contenido ético (HU-04):**
- Las variables `genero` y `pertenencia_etnica` están marcadas como `Sensible` y la columna «Uso en modelo» dice «No».
- La nota de trazabilidad de HU-26 está visible en la Sección D.

**Responsividad:**
- En pantalla < 768 px todas las tablas tienen scroll horizontal sin desbordamiento de layout.

---

## 7. Datos estáticos — referencia de constantes

Los datos de esta vista se definen en `src/data/componentes.ts` con las siguientes exportaciones:

```typescript
export const COMPONENTES_SISTEMA: ComponenteInfo[]    // Sección A (9 items)
export const SENALES_DEBILES: SenalDebil[]             // Sección B.1 (13 items)
export const INDICADORES_FUERTES: IndicadorFuerte[]    // Sección B.2 (6 items)
export const VARIABLES_PROTEGIDAS: VariableProtegida[] // Sección C (10 items)
export const ROLES_HUMANOS: RolHumano[]                // Sección D (6 items)
```

Tipos mínimos:

```typescript
interface ComponenteInfo {
  nombre: string;
  capa: "Usuario" | "Núcleo Híbrido" | "Conocimiento & Ética";
  tecnologia: string;
  funcion: string;
  interaccion: string;
  icono: string; // clase Font Awesome, p.ej. "fa-brain"
}

interface SenalDebil {
  numero: number;
  nombre: string;
  campo: keyof EvaluationRequest;
  contextoRural: string;
}

interface IndicadorFuerte {
  numero: number;
  nombre: string;
  campo: keyof EvaluationRequest;
  justificacion: string;
}

interface VariableProtegida {
  variable: string;
  campo: string;
  tipoDato: string;
  clasificacion: "Sensible" | "Proxy potencial" | "Neutral";
  usoModelo: boolean;
  usoAuditoria: boolean;
}

interface RolHumano {
  rol: string;
  responsabilidad: string;
  decisiones: string;
  hus: string; // e.g. "HU-09, HU-26"
}
```
