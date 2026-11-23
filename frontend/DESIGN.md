---
design_tokens:
  colors:
    primary:
      brand_dark: "#0F2C23" # Verde Selva Profundo — identidad institucional, superficies de máxima autoridad
      brand_main: "#15573F" # Verde Cooperativo — acciones primarias, branding rural
      brand_light: "#218861" # Verde Brote — hover, estados activos
      brand_soft: "#E8F5E9" # Verde Claro — fondos de acento leve, chips de zona rural
    secondary:
      earth_dark: "#4A3222" # Café Tierra Oscuro — contexto agrícola, encabezados de sección productiva
      earth_main: "#8C5A3C" # Café Arcilla — textos de apoyo, ilustraciones de territorio
      earth_soft: "#F5EFEA" # Arena Suave — fondos de tarjetas de contexto rural
    accent_states:
      trust_blue: "#0284C7" # Azul Auditoría — redes bayesianas, transparencia, documentación
      bias_warning: "#6D28D9" # Púrpura Paridad — discriminación detectada, alerta ética (nunca junto a trust_blue en la misma tarjeta)
      risk_low: "#059669" # Verde Aprobación — riesgo < 20 %
      risk_medium: "#D97706" # Ámbar Revisión — riesgo 20–60 %
      risk_high: "#DC2626" # Rojo Fraude — riesgo > 60 %
    neutrals:
      slate_900: "#0F172A" # Texto principal
      slate_700: "#334155" # Texto secundario, encabezados de tabla
      slate_500: "#64748B" # Metadatos, placeholders
      slate_300: "#CBD5E1" # Bordes, campos inactivos
      slate_100: "#F1F5F9" # Fondos de paneles y barras laterales
      white: "#FFFFFF" # Superficies de tarjetas y modales
    dark_mode:
      bg: "#0B0F17" # Fondo global nocturno
      card: "#1E293B" # Tarjetas en modo nocturno
      border: "#334155" # Bordes nocturnos

  typography:
    # Una sola familia para toda la interfaz: Space Grotesk.
    # Humanista, con personalidad propia, sin el peso corporativo de Inter.
    # Solo se añade IBM Plex Mono para fórmulas, coeficientes y bloques de reglas —
    # nunca para etiquetas de datos genéricas (ese uso es un indicador de diseño de IA).
    font_families:
      ui: "'Space Grotesk', 'Segoe UI', system-ui, sans-serif"
      code: "'IBM Plex Mono', 'Courier New', monospace" # Solo fórmulas y código de reglas
    scale:
      # Nombre semántico — no usar tallas numéricas directamente en el JSX
      display: { size: "2.25rem", weight: 700, lh: 1.15, tracking: "-0.02em" } # Hero de cada vista
      headline: { size: "1.75rem", weight: 600, lh: 1.25, tracking: "-0.01em" } # Títulos de sección
      title: { size: "1.25rem", weight: 600, lh: 1.35 } # Encabezados de tarjeta
      body_lg: { size: "1.0625rem", weight: 400, lh: 1.6 } # Texto de formulario y descripción
      body: { size: "0.9375rem", weight: 400, lh: 1.55 } # Párrafos, tooltips
      label: { size: "0.8125rem", weight: 500, lh: 1.4 } # Etiquetas de campo
      caption: { size: "0.75rem", weight: 400, lh: 1.45 } # Metadatos, versión del modelo
      metric: { size: "2.5rem", weight: 700, lh: 1.0, font: "ui" } # Puntaje de riesgo principal
      formula: { size: "0.875rem", weight: 400, lh: 1.6, font: "code" } # Ecuaciones bayesianas

    rules:
      - Longitud de línea máxima en columnas de contenido: 72ch. Las columnas de datos numéricos no tienen este límite.
      - No usar todo en mayúsculas en ninguna etiqueta — ni en botones, ni en chips, ni en encabezados de tabla.
      - No acentuar una sola palabra dentro de un título cambiando su color; si se destaca algo, es un bloque completo (un número, una frase).
      - Sentence case en todos los elementos: botones, labels, tablas, mensajes de error.

  spacing:
    base: "4px"
    scale:
      1: "0.25rem" #  4px
      2: "0.5rem" #  8px
      3: "0.75rem" # 12px
      4: "1rem" # 16px
      6: "1.5rem" # 24px
      8: "2rem" # 32px
      12: "3rem" # 48px
      16: "4rem" # 64px
      24: "6rem" # 96px
    layout:
      sidebar_width: "272px"
      header_height: "60px"
      content_max_width: "1440px"
      grid_columns: 12
      grid_gutter: "24px"
      content_col_max: "72ch" # Columnas narrativas, no datos

  borders_shapes:
    radii:
      none: "0"
      xs: "3px" # Chips y badges de señal
      sm: "6px" # Inputs, selects
      md: "10px" # Tarjetas de evaluación, alertas
      lg: "14px" # Paneles principales y modales
      pill: "100px" # Indicadores de semáforo, puntaje
      # Nota: "pill" no es 9999px — el radio grande es intencional para que
      # no parezca un elemento flotante genérico.
    borders:
      thin: "1px solid"
      accent: "2px solid" # Foco activo, estado de alerta ética
    shadows:
      # Sombras derivadas del verde institucional, no de rgba(0,0,0,0.1)
      sm: "0 1px 3px 0 rgba(15, 44, 35, 0.07)"
      md: "0 4px 10px -2px rgba(15, 44, 35, 0.11), 0 1px 4px -1px rgba(15, 44, 35, 0.06)"
      lg: "0 12px 24px -4px rgba(15, 44, 35, 0.14), 0 4px 8px -2px rgba(15, 44, 35, 0.07)"
      focus: "0 0 0 3px rgba(33, 136, 97, 0.40)"
      bias_focus: "0 0 0 3px rgba(109, 40, 217, 0.35)"
---

# Guía de Diseño UI/UX — CrediConfianza: Detección de Fraude y Auditoría Ética

## 1. Identidad visual y filosofía

CrediConfianza nació como fondo parroquial de caficultores y se convirtió en cooperativa de microcrédito para productores urbanos y rurales. Su interfaz no es un dashboard bancario corporativo ni una consola analítica de fintech. Es un **entorno de decisión responsable**, donde la automatización inteligente y la equidad territorial coexisten en la misma pantalla.

La identidad visual parte de esa dualidad: el verde de la selva andina y el café de la tierra cultivada dan el tono institucional; el púrpura ético marca los momentos de mayor responsabilidad algorítmica. No hay azul SaaS, no hay gradientes decorativos, no hay tarjetas simétricas repetidas.

### Principios de diseño

**Transparencia sin opacidad:** Ningún puntaje de riesgo aparece solo. El desglose tripartito (reglas, bayesiano, ML) es siempre visible junto al número.

**El territorio es contexto, no sesgo:** La interfaz no penaliza visualmente las señales rurales. Cuando el sistema detecta señales de baja correlación con fraude en contexto agrícola, lo dice explícitamente con un banner ético, no con un triángulo de advertencia rojo.

**La decisión final es humana:** Los botones de aprobación y rechazo son el elemento más prominente de cada expediente. El sistema recomienda; el analista decide y firma.

**Una cosa memorable por pantalla:** Cada vista tiene un elemento central de alto contraste que concentra la atención. El resto del layout apoya ese elemento, no compite con él.

---

## 2. Layout de las cuatro vistas

El diseño se aleja del grid de tarjetas simétricas (el tell más común del dashboard genérico). Cada vista tiene su propia estructura, derivada de lo que el analista necesita hacer en ese momento.

### Vista 1 — Originación (evaluación de crédito)

Diseño asimétrico. El panel izquierdo es el expediente vivo; el derecho es la conciencia ética de la decisión.

```
┌────────────────────────────────────────────────────────────────────┐
│  Header: nombre del solicitante · zona · monto solicitado          │
│  [Aprobar]  [Verificar campo]  [Rechazar]  ← siempre visibles     │
├────────────────────────────────────────────┬───────────────────────┤
│                                            │                       │
│  Expediente (65%)                          │  Gobernanza (35%)     │
│  ─────────────────────────────             │  ─────────────────    │
│  Motor tripartito de riesgo                │  Semáforo global      │
│    Reglas activadas                        │  FPR zona rural hoy   │
│    Red bayesiana (nodos)                   │  Impacto de esta      │
│    Probabilidad ML + SHAP                  │  decisión en paridad  │
│                                            │                       │
│  Señales presentes (13 débiles / 6 fuertes)│  Alerta ética         │
│  Factores explicativos (barras divergentes)│  (si aplica)          │
│                                            │                       │
└────────────────────────────────────────────┴───────────────────────┘
```

**Apertura característica de esta vista:** El nombre del solicitante y la zona (rural/urbana) se muestran en tipografía `display` al entrar al expediente. No es un número de ticket; es una persona con una actividad productiva. El puntaje global aparece debajo, en `metric`, con su clasificación de semáforo.

### Vista 2 — Explicabilidad

Diseño de columna única centrada con máximo 72ch de texto. El protagonista es el gráfico de barras divergentes.

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Volver al expediente      Factores que determinaron el fallo │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Nombre del solicitante]  |  Puntaje: 68 — Revisión manual    │
│                                                                 │
│  ┌───────────────── Factores explicativos ─────────────────┐   │
│  │  Cédula de otra región        ████████████▶ +0.31       │   │
│  │  Sin historial crediticio     ███████▶ +0.19             │   │
│  │  Ref. asociación caficultores ◀████████ -0.24            │   │
│  │  Garantía titulada            ◀██████ -0.17              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Interpretación en contexto rural ↓                            │
│  (texto, 72ch máx, sin jerga técnica)                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Apertura característica:** La frase explicativa en `headline` que resume el caso en una línea ("Este caso fue clasificado para revisión porque combina señales de identidad con ausencia de historial, en un contexto donde ambas son comunes en productores cafeteros"). No un número; una oración.

### Vista 3 — Auditoría Ética y Métricas

Diseño de panel principal con barra lateral de filtros. El protagonista es la diferencia de FPR entre zonas.

```
┌──────────────────────────────────────────────────────────────────┐
│  Periodo: [Mes ▼]  Zona: [Todas ▼]  Modelo: [v2.1.0 ▼]          │
├────────────────────────────────────────┬─────────────────────────┤
│                                        │                         │
│  Paridad demográfica (mapa de calor)   │  Métricas globales      │
│  Zona rural vs. urbana                 │  AUC: 0.912             │
│  Género                                │  F1:  0.847             │
│  Grupo étnico / campesino              │  FPR rural: 8.3%        │
│                                        │  FPR urbano: 5.1%       │
│  Distribución de falsos positivos      │                         │
│  (barras apiladas por grupo)           │  ⚖️ Umbral equitativo   │
│                                        │  sugerido: 0.58         │
└────────────────────────────────────────┴─────────────────────────┘
│  Tabla de casos con excepción humana auditada                    │
└──────────────────────────────────────────────────────────────────┘
```

**Apertura característica:** Un único número grande en la parte superior: la brecha de FPR entre zonas. Si está dentro del umbral ético, el número es verde; si lo supera, es el elemento de mayor peso visual en la pantalla.

### Vista 4 — Gobernanza del Sistema

Diseño de documento navegable. Dos columnas: índice fijo a la izquierda, contenido a la derecha.

```
┌──────────────────────────────────────────────────────────────────┐
│  Gobernanza del sistema                                          │
├─────────────────────┬────────────────────────────────────────────┤
│                     │                                            │
│  Índice fijo        │  Contenido (72ch máx)                      │
│  ─────────────      │  ────────────────────                      │
│  Reglas activas     │  Grafo de red bayesiana (SVG interactivo)  │
│  Red bayesiana      │  — nodos: variables socioeconómicas        │
│  Política ética     │  — aristas: relaciones condicionales       │
│  Versiones          │  — sin pastel ni dona                      │
│                     │                                            │
│                     │  Reglas en YAML (bloque code)              │
│                     │  Manual de política (texto fluido)         │
└─────────────────────┴────────────────────────────────────────────┘
```

**Apertura característica:** El grafo bayesiano con sus nodos nombrados. Ningún componente captura mejor la esencia del sistema — incertidumbre razonada, no puntuación opaca.

---

## 3. Componentes clave

### 3.1 Motor tripartito de riesgo

Tres franjas horizontales o una tabla de tres filas dentro del expediente. Cada motor muestra su sub-puntaje y su contribución ponderada al puntaje global. No son tarjetas separadas — son partes de un mismo razonamiento.

| Motor           | Visualización                                                                  | Cuando falta                               |
| --------------- | ------------------------------------------------------------------------------ | ------------------------------------------ |
| Reglas expertas | Lista de verificación con severidad (crítica / moderada / contextual)          | Muestra "Sin reglas activadas" en verde    |
| Red bayesiana   | Nodos activos + probabilidad $P(\text{Fraude} \mid \text{evidencia})$ en texto | "Motor bayesiano no disponible" con alerta |
| ML supervisado  | Barra de probabilidad 0–1 con intervalo de confianza                           | "Modelo sin datos suficientes" con alerta  |

Al hacer foco en el puntaje global, se resaltan simultáneamente los tres factores con mayor peso. Esto es una microinteracción de foco, no de hover — funciona en tablet táctil.

### 3.2 Alerta de sesgo ético

Banner de borde izquierdo grueso (`bias_warning #6D28D9`) que aparece cuando el caso rural activa señales de baja correlación con fraude agrícola. Nunca aparece junto a otro banner de `trust_blue` en la misma tarjeta — esos dos acentos no conviven.

Contenido del banner: hecho → impacto en paridad → acción disponible. Sin signos de admiración múltiples, sin lenguaje de alarma exagerado.

Ejemplo:

> Este caso incluye tres señales que, en contexto de microcrédito agrícola, no predicen fraude. La tasa de falsos positivos rural en esta oficina está 3.2 puntos por encima del umbral acordado. Puede solicitar verificación de campo antes de decidir.

### 3.3 Botonera de decisión humana

Tres acciones, siempre visibles en la cabecera del expediente. No flotantes, no al final del scroll.

- **Aprobar** — fondo sólido `brand_main`, texto blanco. Es el botón más ancho.
- **Solicitar verificación de campo** — borde `trust_blue`, fondo transparente. Mismo alto que Aprobar.
- **Rechazar** — texto `risk_high`, fondo `slate_100`. La acción más discreta visualmente porque requiere confirmación modal.

El modal de sobrescritura no es una advertencia de peligro — es un formulario de auditoría breve: motivo (selección), contexto verificado (texto libre, obligatorio), firma con `user_id` y `model_version`.

### 3.4 Barras divergentes de explicabilidad

Barras horizontales centradas en un eje neutro. Las barras hacia la derecha (factores que elevan el riesgo) usan el tono del nivel de riesgo actual. Las barras hacia la izquierda (factores que lo reducen) usan `brand_light`.

Los valores numéricos (pesos SHAP) se muestran en `formula` (IBM Plex Mono) solo aquí — no en el resto de la interfaz. Cada barra tiene un label en sentence case con el nombre del factor en lenguaje del solicitante, no del modelo.

---

## 4. Motion

Una sola secuencia orquestada por vista, al cargar. Sin animaciones en scroll, sin fade-and-slide en cada sección, sin transiciones de hover en cada tarjeta.

- **Originación:** El puntaje global entra con un conteo de 0 al valor real (500 ms, `ease-out`). Los motores aparecen en cascada 100 ms después.
- **Explicabilidad:** Las barras divergentes se "pintan" desde el centro hacia afuera (400 ms).
- **Auditoría:** El número principal de brecha FPR aparece primero; el mapa de calor se rellena 200 ms después.
- **Gobernanza:** El grafo bayesiano aparece con un fade de nodos (300 ms) y luego las aristas (200 ms adicionales).

Las transiciones de estado (hover de botón, apertura de modal, cambio de tab) usan 150 ms, `ease-in-out`. Respetar `prefers-reduced-motion`: si está activo, todas las animaciones usan `transition: none`.

---

## 5. Escritura en la interfaz

**Desde la perspectiva del analista, no del sistema.** El analista gestiona expedientes, no procesa transacciones. Evalúa solicitantes, no clasifica registros.

**Voz activa en todos los controles.**

- Botones: "Aprobar solicitud", "Solicitar verificación", "Registrar excepción" — no "Enviar", "Continuar", "Aceptar".
- Mensajes de confirmación: "Solicitud aprobada. Expediente guardado con la decisión de [nombre del analista]." No "Operación completada con éxito."

**Los errores explican qué pasó y qué hacer.**

- "El motor bayesiano no recibió datos de zona. Verifica que el campo Tipo de zona esté completo antes de evaluar." No "Error en componente bayesiano (500)."

**Vacíos son invitaciones.**

- Lista de expedientes vacía: "No hay solicitudes pendientes para esta oficina hoy. Las nuevas solicitudes aparecen aquí en tiempo real."

**Terminología del dominio, no del modelo.**

- "Coherencia del negocio declarado" (no "feature importance score")
- "Señales de contexto rural" (no "weak signals")
- "Revisión manual recomendada" (no "medium risk threshold exceeded")
- "Excepción auditada por analista" (no "human override logged")

---

## 6. Accesibilidad

**Contraste:**

- Todo texto sobre fondo blanco o `slate_100` cumple 4.5:1 mínimo.
- Texto de puntaje (`metric`) sobre cualquier fondo: 7:1 mínimo.
- Texto sobre `bias_warning #6D28D9`: usar `#EDE9FE` (claro) o `#FFFFFF`, no texto oscuro sobre fondo púrpura oscuro.

**Sin codificación por color exclusiva.**
Cada indicador de riesgo combina: icono descriptivo + texto explícito + color. Los íconos son de Material Symbols (`block`, `warning`, `check_circle`, `balance`) cargados sin capa CSS adicional.

**Objetivos táctiles:** Mínimo 44 × 44 px en todos los controles interactivos — especialmente en la botonera de decisión, pensada para tablet en campo.

**Foco de teclado:** Anillo de 3 px usando `shadow-focus` (verde) para elementos normales y `shadow-bias-focus` (púrpura) para elementos dentro del banner ético. `tabindex` lógico: cabecera → motor tripartito → acciones → panel de gobernanza.

**Navegación:** `aria-current` en la vista activa del nav principal. Enlace de salto al contenido principal visible en foco. `scroll-padding-top` compensando el header fijo (60 px + 20 px de holgura).

---

## 7. Implementación en Tailwind CSS v4

Tokens activos en `src/styles/index.css` dentro del bloque `@theme`:

**Colores:** `--color-brand-dark`, `--color-brand-main`, `--color-brand-light`, `--color-brand-soft`, `--color-earth-dark`, `--color-earth-main`, `--color-earth-soft`, `--color-trust-blue`, `--color-bias-warning`, `--color-risk-low`, `--color-risk-medium`, `--color-risk-high`, `--color-slate-{100,300,500,700,900}`, `--color-white`.

**Tipografía:** `--font-ui` (Space Grotesk), `--font-code` (IBM Plex Mono). Escala: `--text-display`, `--text-headline`, `--text-title`, `--text-body-lg`, `--text-body`, `--text-label`, `--text-caption`, `--text-metric`, `--text-formula`. Cada variable embebe size + line-height + weight.

**Radios:** `--radius-xs` (3px), `--radius-sm` (6px), `--radius-md` (10px), `--radius-lg` (14px), `--radius-pill` (100px). No usar `radius-full` como alias de 9999px — el valor `pill` es intencional y distinto.

**Sombras:** `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-focus`, `--shadow-bias-focus`.

**Notas de implementación:**

- Iconos Material Symbols: hoja de Google Fonts cargada sin capa. Para tamaños distintos a 24px usar el modificador `!` de Tailwind v4: `className="text-[16px]!"`.
- Header fijo: `html { scroll-padding-top: 5rem }` (60px + 20px de holgura).
- Space Grotesk se carga desde Google Fonts con `display=swap`. Pesos necesarios: 400, 500, 600, 700.
- IBM Plex Mono se carga solo en las vistas de Explicabilidad y Gobernanza mediante import condicional en el bundle — no en el CSS global.
- Logo: `src/assets/crediconfianza-logo.svg` (recurso local, sin dependencias externas).

---

## 8. Vistas de ruta: Mapa de Arquitectura (`/arquitectura`) y Componentes & Roles (`/roles`)

Ambas vistas reproducen pantallas de Stitch (`1349464880252284101`) y se gobiernan por los
contratos `docs/contracts/frontend/01-mapa-interactivo.md` y `03-componentes-roles.md`.

**Chrome compartido.** El layout `AppLayout` envuelve todas las rutas con el `SiteHeader` y
`SiteFooter` de la landing (decisión explícita: ignorar el header/pie propios de cada pantalla
de Stitch). `StickyCtaBar` solo se monta en `/`. Ambas vistas comparten la barra de pestañas
`GovernanceTabs` (Mapa Interactivo · Simulador de Inferencia · Componentes & Roles) con
`aria-current="page"` en la pestaña activa.

**Paleta por zona (mapa).**

| Zona                     | Escala Tailwind                    | Nota                                        |
| ------------------------ | ---------------------------------- | ------------------------------------------- |
| A · Entorno de Usuario   | `sky`                              | `sky-600` ≡ `trust-blue` #0284C7 del diseño |
| B · Núcleo Híbrido       | `violet`                           | #7C3AED (icono destacado `bg-violet-600`)   |
| C · Conocimiento y Ética | `primary-container` / `brand-soft` | verde institucional                         |

Los conectores entre zonas son píldoras horizontales con etiqueta de flujo
(`Solicitud ↓`, `Evaluación / Score + Factores ↑`, `Reglas ←`, `Actualización / Auditoría ↑`).

**Tablas.** `src/components/table/SortableTable.tsx` es la tabla genérica de ambas vistas:
cabeceras ordenables con `<th aria-sort>` + botón (`ascending → descending → orden original`),
`<caption class="sr-only">` y contenedor `overflow-x-auto` con `min-w-[720px]` para pantallas
angostas. El tinte de hover se parametriza (`hoverClassName`) para las filas ámbar (señales
débiles) y rojas (indicadores fuertes).

**Desviaciones documentadas frente al diseño de Stitch:**

- **Estados de motor:** el inspector del mapa muestra siempre la píldora estática `Motor: ok`
  (el contrato §5 indica oculto/`—` cuando no hay contexto; la app no consume backend aún).
- **Botones sin `alert()`:** «Ficha Técnica PDF» invoca `window.print()` con guarda
  `typeof window.print === "function"`; «Verificar Conformidad HU-26» despliega el checklist
  en línea (5 ítems + firma del auditor) en lugar de un diálogo nativo.
- **«Restablecer Vista»:** movido del encabezado de pantalla al hero de la vista del mapa
  (misma función: deshabilitado sin selección).
- **Leyenda `[?]` de variables protegidas:** popover `role="dialog"` controlado con el hook
  compartido `useDisclosure` (cierra fuera/Escape), no un tooltip nativo.
- **Iconos:** Material Symbols en toda la UI (el diseño de Stitch usa Font Awesome en la
  landing); respetar `text-[Npx]!` con el modificador de Tailwind v4.
