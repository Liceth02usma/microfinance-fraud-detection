# Diccionario de Datos y Clasificación de Variables (CrediConfianza)

**Proyecto:** Sistema Inteligente para Detección de Fraude en Microfinanzas  
**Entidad:** Cooperativa CrediConfianza (San Juan de la Vega, Valles Templados)  
**Historias de Usuario asociadas:** HU-04 (Variables y grupos protegidos) y HU-08 (Diccionario de datos y validación del dataset)  
**Fecha:** Noviembre 2026 · **Responsable:** Dev 2 (con Dev 3)

---

## 1. Definición y Clasificación Ética de Variables (HU-04)

De acuerdo con el marco ético y regulatorio del proyecto (HU-04 y HU-09), cada variable del sistema se clasifica en una de tres categorías éticas:

1. **Sensible:** Atributo protegido por ley y principios de no discriminación (género, pertenencia étnica/campesina, zona de residencia). **Criterio de uso:** No se utilizan como predictores directos en el motor de machine learning de producción para evitar discriminación directa; se utilizan de forma exclusiva en la auditoría ética (HU-21, HU-22) y para condicionar reglas de contexto que protejan al solicitante legítimo.
2. **Proxy potencial:** Variable neutral en apariencia que correlaciona indirectamente con grupos vulnerables o rurales (oficina rural, celular prepago, factura manual, ausencia de georreferenciación). **Criterio de uso:** Su ponderación está condicionada al contexto del solicitante; nunca genera una alerta roja de forma aislada (HU-18).
3. **Neutral:** Variable puramente transaccional, financiera o documental (monto, plazo, indicios directos de alteración de documentos).

---

## 2. Diccionario Detallado de Variables

| Nombre de Variable | Tipo de Dato | Concepto Ontológico (HU-03) | Clasificación Ética (HU-04) | Rango / Valores Permitidos | Descripción Funcional |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id_solicitud` | String | Solicitante / Decisión | Neutral | Formato `SOL-####-######` | Identificador único y determinista de la solicitud. |
| `nombre_sintetico` | String | Solicitante | Neutral | Cadena de texto (Faker es_CO) | Nombre simulado del solicitante (no corresponde a personas reales). |
| `documento_identidad` | String | Documento / Solicitante | Neutral | Formato `CC-########` | Número de cédula simulado. |
| `tipo_zona` | String (Enum) | Zona | **Sensible** | `urbana`, `rural` | Zona de radicación de la actividad productiva. |
| `oficina` | String (Enum) | Zona | Proxy potencial | 14 sedes (7 urbanas, 7 rurales) | Oficina de CrediConfianza que origina el microcrédito. |
| `genero` | String (Enum) | Solicitante | **Sensible** | `femenino`, `masculino`, `otro` | Género del titular; reservado para métricas de paridad. |
| `pertenencia_etnica` | String (Enum) | Solicitante | **Sensible** | `campesino`, `afrodescendiente`, `indigena`, `ninguno` | Grupo poblacional para análisis de equidad e impacto dispar. |
| `producto_credito` | String (Enum) | Solicitud / Negocio | Neutral | `consumo`, `microempresa`, `vivienda`, `agropecuario` | Línea de producto crediticio solicitada. |
| `tipo_negocio` | String (Enum) | Negocio | Proxy potencial | `local_fijo`, `plaza_mercado_feria`, `parcela_finca`, `servicios_domicilio` | Naturaleza operativa de la microempresa o cultivo. |
| `monto_solicitado` | Float | Solicitud | Neutral | 1.000.000 – 35.000.000 COP | Capital solicitado en pesos colombianos. |
| `plazo_meses` | Integer | Solicitud | Neutral | 6, 12, 18, 24, 36 | Plazo de amortización en meses. |
| `ingresos_declarados` | Float | Negocio / Solicitante | Neutral | > 0 COP (Lognormal) | Ingreso mensual promedio reportado por el asociado. |
| `es_estacional` | Binario (0/1) | Negocio | Proxy potencial | 0, 1 | Indica fluctuación de ingresos por ciclos de cosecha agrícola. |
| `antiguedad_negocio_meses` | Integer | Negocio | Neutral | 6 – 180 meses | Tiempo de operación de la unidad económica o parcela. |
| `edad_solicitante` | Integer | Solicitante | Neutral | 18 – 72 años | Edad biológica del titular del microcrédito. |
| `es_fraude_real` | Binario (0/1) | Alerta / Decisión | Neutral (Target) | 0 (Legítimo), 1 (Fraude) | Etiqueta real para entrenamiento y evaluación (nunca usada en inferencia en vivo). |

### Señales Débiles (Informalidad / Contexto Rural — HU-02)

| Nombre de Variable | Tipo | Concepto | Clasificación | Valores | Justificación en el Dominio Rural |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `sin_historial` | Binario | Señal | Proxy potencial | 0, 1 | Habitual en primerizos rurales sin bancarización previa. |
| `vive_lejos` | Binario | Zona / Señal | Proxy potencial | 0, 1 | Refleja distancia veredal a cabeceras municipales. |
| `sin_local_fijo` | Binario | Negocio / Señal | Proxy potencial | 0, 1 | Típico de parcelas, ferias campesinas y venta ambulante. |
| `sin_fiador` | Binario | Referencia / Señal | Proxy potencial | 0, 1 | Común por falta de familiares con salario formal. |
| `cedula_otra_region` | Binario | Documento / Señal | Proxy potencial | 0, 1 | Frecuente por migración de mano de obra recolectora de café. |
| `celular_prepago` | Binario | Solicitante / Señal | Proxy potencial | 0, 1 | Modalidad predominante de telefonía en veredas. |
| `sin_cuenta_bancaria` | Binario | Solicitante / Señal | Proxy potencial | 0, 1 | Economía campesina basada exclusivamente en efectivo. |
| `factura_manual` | Binario | Documento / Señal | Proxy potencial | 0, 1 | Comprobantes en talonario o cuadernos sin facturación electrónica. |
| `fotos_poco_convincentes` | Binario | Documento / Señal | Proxy potencial | 0, 1 | Limitaciones de conectividad, cámaras sencillas o predios abiertos. |
| `sin_referencias_comerciales` | Binario | Referencia / Señal | Proxy potencial | 0, 1 | Proveedores locales de granos o insumos sin registro formal. |
| `nombre_distinto_recibo` | Binario | Documento / Señal | Proxy potencial | 0, 1 | Arriendos de palabra, recibos comunitarios o predios heredados. |
| `negocio_pequeno_monto` | Binario | Negocio / Señal | Neutral | 0, 1 | Discrepancia entre activo observable y monto solicitado. |
| `direccion_sin_georreferenciar` | Binario | Zona / Señal | Proxy potencial | 0, 1 | Ausencia de nomenclatura urbana en caminos veredales. |

### Indicios Fuertes de Fraude (Alteración Directa / Crítica — HU-02)

| Nombre de Variable | Tipo | Concepto | Clasificación | Valores | Impacto en el Modelo |
| :--- | :---: | :---: | :---: | :---: | :--- |
| `cedula_alterada` | Binario | Documento | Neutral | 0, 1 | Inconsistencias graves en código de barras, holograma o tipografía. |
| `ingresos_inconsistentes` | Binario | Negocio | Neutral | 0, 1 | Contradicción matemática irreconciliable entre gastos y ventas. |
| `factura_falsa` | Binario | Documento | Neutral | 0, 1 | NIT inexistente, numeración adulterada o proveedor no habido. |
| `referencias_falsas` | Binario | Referencia | Neutral | 0, 1 | Números telefónicos simulados o concertación confirmada. |
| `historial_adverso` | Binario | Solicitante | Neutral | 0, 1 | Reporte en listas restrictivas o suplantación en bases externas. |
| `negocio_inconsistente` | Binario | Negocio | Neutral | 0, 1 | Inexistencia física del negocio o de la siembra en visita pericial. |

---

## 3. Tabla Resumen para Documento Académico (Formato APA 7)

**Tabla 1**  
*Resumen de variables del dataset sintético de microfinanzas CrediConfianza*

| Categoría de Variables | Cantidad | Variables Representativas | Clasificación Ética Principal | Rol en el Prototipo |
| :--- | :---: | :--- | :--- | :--- |
| Identificación y Trámite | 3 | `id_solicitud`, `nombre_sintetico`, `documento_identidad` | Neutral | Trazabilidad del caso |
| Geográficas y Organizacionales | 2 | `tipo_zona`, `oficina` | Sensible / Proxy | Estratificación y auditoría de sesgo |
| Sociodemográficas y Étnicas | 3 | `genero`, `pertenencia_etnica`, `edad_solicitante` | Sensible / Neutral | Auditoría de equidad (Fairlearn) |
| Económicas y Financieras | 6 | `producto_credito`, `tipo_negocio`, `monto_solicitado`, `plazo_meses`, `ingresos_declarados`, `antiguedad_negocio_meses` | Neutral / Proxy | Modelado ML y scoring probabilístico |
| Señales Débiles (Informalidad) | 13 | `celular_prepago`, `factura_manual`, `sin_cuenta_bancaria`, `direccion_sin_georreferenciar`, entre otras | Proxy potencial | Reglas contextuales y red bayesiana |
| Indicios Fuertes de Fraude | 6 | `cedula_alterada`, `factura_falsa`, `ingresos_inconsistentes`, `referencias_falsas`, etc. | Neutral | Reglas duras y alertas críticas |
| Target Supervisado | 1 | `es_fraude_real` | Neutral | Solo entrenamiento y evaluación |

*Nota.* Elaboración propia basada en la matriz de adquisición de CrediConfianza y el diseño metodológico de la investigación (2026). Las variables sensibles no se usan como features directas en la predicción automatizada para garantizar no-discriminación por diseño.

---

## 4. Estrategia de Partición Estratificada

Para evitar desbalances entre subgrupos y garantizar una evaluación imparcial, el dataset se divide utilizando estratificación compuesta:

$$\text{Estrato} = \text{es\_fraude\_real} \times \text{tipo\_zona}$$

* **Entrenamiento (70%):** Utilizado para ajustar los modelos de machine learning supervisados.
* **Validación (15%):** Utilizado para calibración de probabilidades (`CalibratedClassifierCV`) y selección de umbrales.
* **Prueba (15%):** Conjunto ciego reservado estrictamente para la evaluación comparativa (HU-16), auditoría ética (HU-21, HU-23) y análisis de errores (HU-29).
