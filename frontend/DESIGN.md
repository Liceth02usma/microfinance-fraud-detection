---
design_tokens:
  colors:
    primary:
      brand_dark: "#0F2C23" # Verde Selva Profundo (Identidad institucional y solidez institucional)
      brand_main: "#15573F" # Verde Cooperativo (Acciones principales y branding rural)
      brand_light: "#218861" # Verde Brote (Estados hover y destaques)
      brand_soft: "#E8F5E9" # Verde Claro (Superficies activas y fondos de acento)
    secondary:
      earth_dark: "#4A3222" # Café Tierra Oscuro (Contexto agrícola/rural)
      earth_main: "#8C5A3C" # Café Arcilla (Subtítulos de contexto productivo)
      earth_soft: "#F5EFEA" # Arena Suave (Fondos de tarjetas de contexto rural)
    accent_and_states:
      trust_blue: "#0284C7" # Azul Auditoría / Transparencia (Redes Bayesianas y Reglas)
      bias_warning: "#7C3AED" # Púrpura Paridad / Alerta de Sesgo Ético (Discriminación detectada)
      risk_low: "#059669" # Verde Aprobación (Riesgo Bajo de Fraude < 20%)
      risk_medium: "#D97706" # Ámbar Alerta / Revisión Manual (Riesgo 20% - 60%)
      risk_high: "#DC2626" # Rojo Fraude / Bloqueo (Riesgo > 60%)
    neutrals:
      slate_900: "#0F172A" # Texto principal (Máximo contraste)
      slate_700: "#334155" # Texto secundario / Encabezados de tablas
      slate_500: "#64748B" # Texto auxiliar / Labels y metadatos
      slate_300: "#CBD5E1" # Bordes dividores y campos desactivados
      slate_100: "#F1F5F9" # Fondos de contenedores y paneles laterales
      surface_white: "#FFFFFF" # Fondos de tarjetas y modales
    dark_mode_surfaces:
      bg_dark: "#0B0F17" # Fondo global en modo nocturno
      card_dark: "#1E293B" # Tarjetas en modo nocturno
      border_dark: "#334155" # Bordes nocturnos

  typography:
    font_families:
      display: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      mono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace" # Para métricas, coeficientes y reglas expertas
    font_sizes:
      xs: "0.75rem" # 12px - Labels, metadatos, tags de paridad
      sm: "0.875rem" # 14px - Texto de tablas, descripciones de reglas
      base: "1.0rem" # 16px - Cuerpo de texto estándar, inputs
      lg: "1.125rem" # 18px - Encabezados de tarjetas, subtítulos
      xl: "1.25rem" # 20px - Títulos de sección
      2xl: "1.5rem" # 24px - Puntajes de riesgo / Indicadores clave
      3xl: "1.875rem" # 30px - Encabezados principales de dashboard
      4xl: "2.25rem" # 36px - Métricas destacadas de auditoría global
    font_weights:
      regular: 400
      medium: 500
      semibold: 600
      bold: 700
    line_heights:
      tight: 1.2
      snug: 1.375
      normal: 1.5
      relaxed: 1.625

  spacing_and_dimensions:
    base_unit: "4px"
    scale:
      space_1: "0.25rem" # 4px
      space_2: "0.5rem" # 8px
      space_3: "0.75rem" # 12px
      space_4: "1.0rem" # 16px
      space_6: "1.5rem" # 24px
      space_8: "2.0rem" # 32px
      space_12: "3.0rem" # 48px
      space_16: "4.0rem" # 64px
    layout:
      sidebar_width: "280px"
      header_height: "64px"
      content_max_width: "1600px"
      grid_columns: 12
      grid_gutter: "24px"

  borders_and_shapes:
    radii:
      none: "0px"
      sm: "4px" # Badges y tags pequeños
      md: "8px" # Inputs, botones, alertas
      lg: "12px" # Tarjetas de evaluación y paneles
      xl: "16px" # Modales y contenedores principales
      full: "9999px" # Avatares y píldoras de estado
    borders:
      thin: "1px solid"
      medium: "2px solid"
      thick: "4px solid"
    shadows:
      elevation_sm: "0 1px 2px 0 rgba(15, 23, 42, 0.05)"
      elevation_md: "0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.04)"
      elevation_lg: "0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -2px rgba(15, 23, 42, 0.05)"
      elevation_focus: "0 0 0 3px rgba(33, 136, 97, 0.35)"
      elevation_bias_alert: "0 0 0 3px rgba(124, 58, 237, 0.30)"
---

# Guía de Arquitectura de Diseño UI/UX: CrediConfianza Fraude & Auditoría Ética

## 1. Visión Holística y Filosofía de Diseño

El sistema de evaluación de riesgo de fraude para **CrediConfianza** no es un dashboard bancario tradicional ni una consola analítica opaca. Es un **entorno colaborativo de toma de decisiones responsable**, diseñado específicamente para resolver la tensión entre la automatización inteligente (ML + Redes Bayesianas + Reglas Expertas) y la equidad socioeconómica territorial en San Juan de la Vega y los Valles Templados.

### Principios Directores de UX:

1. **Transparencia Radical e Inmediata (XAI):** Jamás mostrar un puntaje de riesgo aislado sin su desglose explicativo (reglas activadas, nodos bayesianos desajustados y valores SHAP del modelo ML).
2. **Mitigación Activa del Sesgo Rural:** El diseño debe resaltar visualmente las características estructurales del crédito rural (estacionalidad de cosechas, efectivo en ferias, direcciones sin nomenclatura, telefonía prepago) para evitar que la interfaz induzca penalizaciones automáticas o apresuradas por parte del analista.
3. **Auditoría Ética como Primera Ciudadana:** La métrica de paridad demográfica y la tasa de falsos positivos en zonas rurales son visibles en la barra superior y en el flujo de decisión individual.
4. **Resiliencia Operativa:** La interfaz debe comportarse impecablemente en pantallas corporativas de la oficina urbana y en tabletas con conectividad intermitente en visitas de campo rurales.

---

## 2. Pautas de Comportamiento de Componentes

### 2.1. Tarjeta del Motor Tripartito de Riesgo (Score Dashboard Card)

El corazón de la revisión de cada caso es el contenedor que fusiona los tres motores de razonamiento:

- **Visualización:** Tres columnas o un panel segmentado que muestra la contribución ponderada:
  - **Reglas Expertas (Determinista):** Lista de chequeo con severidad (Crítica, Moderada, Informativa).
  - **Red Bayesiana (Probabilístico):** Grafo condicional o barra de probabilidad acumulada que evalúa la coherencia del negocio (p. ej., $P(\text{Fraude} \mid \text{Ingreso Estacional, Sin Local Fijo})$).
  - **Machine Learning (Estadístico):** Puntaje del modelo supervisado con barra de confianza.
- **Microinteracción:** Al hacer _hover_ o _focus_ en el indicador de riesgo global (p. ej., 68% Riesgo Moderado), se destacan simultáneamente en pantalla las tres razones principales que construyeron ese número.

### 2.2. Panel de Alerta de Sesgo Ético y Paridad (Ethical Bias Monitor)

Componente de notificación fija en la ficha de crédito rural/urbano.

- **Comportamiento:** Si un solicitante es marcado de alto riesgo debido a señales históricamente sesgadas (e.g., "Factura manual", "Dirección no georreferenciada", "Teléfono prepago"), el sistema despliega un banner de estilo `bias_warning` (Púrpura `#7C3AED`).
- **Contenido del Banner:**
  > ⚠️ **Alerta de Contexto Rural:** Este caso incluye 3 señales sensibles de baja correlación con fraude en microcrédito agrícola. La paridad de aprobación rural en esta oficina está un 4.2% por debajo del umbral ético instituido.
- **Acción Obligatoria:** Enlace rápido para solicitar comprobación de campo o condonar el indicador situacional mediante justificación auditada.

### 2.3. Sistema de Botones y Sobrescritura Humana (Human-in-the-Loop Actions)

El analista posee la decisión final. La interfaz debe hacer que la sobrescritura del modelo sea clara, intencional y formalmente documentada.

- **Botonera Principal:**
  - `Aprobar Solicitud`: Estilo primario `brand_main` (`#15573F`). Fondo sólido con texto blanco.
  - `Solicitar Verificación de Campo`: Estilo secundario con borde `trust_blue` (`#0284C7`) para resolver ambigüedades documentales en la parcela/local.
  - `Rechazar por Fraude Confirmado`: Estilo de peligro en tono plano con confirmación modal obligatoria (`#DC2626`).
- **Comportamiento Modal de Sobrescritura:** Si el modelo sugiere rechazar por riesgo alto y el analista decide aprobar (o viceversa), se abre un modal de auditoría ética donde debe seleccionar el factor contextual relevante (e.g., _Ciclo cosechero verificado en visita_) y firmar digitalmente la excepción.

### 2.4. Matriz de Explicabilidad (XAI Factors Table)

- **Visualización:** Barras horizontales divergentes.
  - Barras hacia la derecha en **Rojo/Naranja**: Factores que _aumentan_ la probabilidad de fraude (ej. Inconsistencia entre cédula y base de datos).
  - Barras hacia la izquierda en **Verde**: Factores que _disminuyen_ la probabilidad de fraude (ej. Referencia favorable de la asociación de caficultores local).
- **Tipografía:** Números y pesos representados en tipografía monoespaciada (`JetBrains Mono`) para alineación rápida.

---

## 3. Criterios de Accesibilidad (WCAG 2.1 AA/AAA)

Para garantizar la usabilidad tanto para analistas en oficina como para asesores de crédito en dispositivos móviles en zonas rurales expuestas a luz solar directa:

1. **Relación de Contraste de Color:**
   - Todo texto sobre superficie blanca o `slate_100` cumple con una relación de contraste mínima de **4.5:1** para texto normal y **7:1** para texto de métricas de riesgo crítico.
   - El texto del indicador de paridad ética sobre fondo púrpura suave (`#F3E8FF`) utiliza un tono de texto ultra oscuro (`#5B21B6`) alcanzando una relación de **9.2:1**.
2. **Simbología Doble (No solo color):**
   - Los indicadores de riesgo no dependen exclusivamente del color (Rojo, Ámbar, Verde). Cada valor incluye un icono descriptivo unívoco y texto explícito:
     - 🛑 **Alto Riesgo (Bloqueo)**
     - ⚠️ **Riesgo Medio (Revisión)**
     - ✅ **Riesgo Bajo (Conforme)**
     - ⚖️ **Alerta de Paridad Ética**
3. **Áreas de Interacción Táctil (Touch Targets):**
   - Todos los elementos interactivos (botones de aprobación, selectores de filtro, casillas de verificación de listas de chequeo) poseen un tamaño mínimo de **44 × 44 px** para facilitar su uso en tabletas de trabajo de campo.
4. **Navegación por Teclado y Visualización de Foco:**
   - Navegación secuencial lógica (`Tabindex`) a través de la lista de verificación de fraude.
   - Todos los elementos enfocables muestran un anillo exterior claro de `3px` usando la sombra `elevation_focus` (`#218861`) o `elevation_bias_alert` (`#7C3AED`).

---

## 4. Instrucciones Anti-Convergencia Distribucional (Evitar Diseños Genéricos de IA)

Para asegurar que la interfaz de usuario de CrediConfianza no luzca como una plantilla genérica de dashboard comercial o un clon estándar de Tailwind UI, la implementación frontend debe seguir estrictamente estas directrices estructurales:

### 4.1. Arquitectura de Pantalla Orientada a la Paridad Territorio-Riesgo

- **Prohibido:** Diseñar páginas con un grid simétrico repetitivo de 4 tarjetas idénticas en la parte superior (e.g., "Total Casos", "Aprobados", "Rechazados", "Monto").
- **Requerido:** Implementar un **Panel Asimétrico Dual de Decisión**:
  - _Lado Izquierdo (65% ancho):_ Expediente del solicitante con desglose de datos productivos y trazabilidad de los tres motores de razonamiento.
  - _Lado Derecho (35% ancho):_ Widget dinámico de **Gobernanza y Auditoría Ética**, que mantiene visible el impacto que la decisión actual tendrá en la tasa regional de falsos positivos rurales.

### 4.2. Micro-copia Contextual de Microfinanzas

- **Prohibido:** Usar labels genéricos como `User Name`, `Score`, `Status`, `Transaction ID`, `Alert level`.
- **Requerido:** Emplear terminología financiera y territorial precisa:
  - `Asociado / Solicitante Agropecuario`
  - `Índice de Coherencia de Negocio Rural (Bayesiano)`
  - `Puntaje de Riesgo Combinado (ML + Reglas)`
  - `Evaluación de Sesgo por Falta de Historial Tradicional`
  - `Condonación por Evidencia de Campo`

### 4.3. Visualización Única para el Grafo Probabilístico Bayesiano

- **Prohibido:** Usar gráficas de pastel o donas genéricas para mostrar el riesgo.
- **Requerido:** Representar el motor probabilístico como una **Red de Creencia Condicional Interactiva** en SVG o Canvas ligero, donde los nodos representan variables socioeconómicas (e.g., _Ubicación dispersa_, _Ventas en efectivo_, _Ausencia de local_) y sus conexiones muestran cómo se propaga la incertidumbre sin penalizar injustamente la condición rural.

### 4.4. Paleta Temática "Tierra y Confianza"

- Evitar el azul "SaaS genérico" (`#3B82F6`) como color primario del sistema.
- Utilizar la combinación de **Verde Selva Profundo (`#0F2C23`)** y **Café Tierra (`#8C5A3C`)**, que refleja la herencia de CrediConfianza nacida como fondo parroquial de caficultores, equilibrada con el **Púrpura Ético (`#7C3AED`)** para denotar analítica avanzada e imparcialidad algoritmitizada.

## 5. Implementación en Tailwind CSS v4

Los tokens anteriores están implementados en `src/styles/index.css` dentro del bloque `@theme` (Tailwind CSS v4 con plugin `@tailwindcss/vite` en `vite.config.ts`):

- **Colores:** `--color-*` (p. ej. `bg-surface-container-lowest`, `text-primary`, `text-risk-high`, `bg-earth-soft`, `text-bias-warning`).
- **Tipografía:** `--font-*` (Inter / JetBrains Mono) y `--text-*` con línea y peso embebidos (`text-display`, `text-headline-lg`, `text-body-md`, `text-label-md`, `text-metric-data`…).
- **Espaciado y radios:** `--spacing-*` (escala `space-*`, `gutter`, `margin`) y `--radius-*` (el diseño define `radius-full: 0.75rem`, no un píldora perfecta).
- **Sombras:** `--shadow-elevation-*`, `--shadow-header`, `--shadow-sticky`.

Notas de implementación:

- **Iconos Material Symbols:** la hoja de Google Fonts se carga **sin capa** (`<link>` en `index.html`), por lo que gana en cascada sobre las utilidades de Tailwind (que viven en `@layer utilities`). Para forzar un tamaño distinto al `24px` por defecto se usa el modificador `!` de Tailwind v4: `className="text-[16px]!"`.
- **Anclas y header fijo:** `html { scroll-padding-top: 7rem }` compensa el encabezado fijo de 80px (equivalente al `scroll-mt-28` del diseño original).
- **Logo:** el recurso original del diseño de Stitch estaba inaccesible (HTTP 400), por lo que se reemplaza por `src/assets/crediconfianza-logo.svg` (marca local, sin dependencias externas).
- **Accesibilidad:** anillo de foco de 3px `#218861`, enlace de salto, `prefers-reduced-motion`, objetivos táctiles ≥44px y `aria-current` en la navegación activa.
