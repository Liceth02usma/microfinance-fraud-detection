# Backlog de producto: detección de fraude en microfinanzas (CrediConfianza)

Oct 29, 2026 · @juan

## Convenciones

El backlog reúne 37 historias de usuario en 7 épicas, suma 164 puntos y se reparte en 5 sprints de 2 semanas para los 4 desarrolladores. El stack acordado es React en el frontend y FastAPI en el backend, con Python para los motores de reglas, red bayesiana y ML. Si la entrega llega en 8 semanas, el sprint 5 (cierre documental) se traslapa con el sprint 4.

**Roles de usuario** que aparecen en las historias:

- Analista de crédito: revisa solicitudes y decide.
- Comité de riesgo: recibe los casos escalados.
- Auditor ético: revisa equidad y cumplimiento.
- Administrador del sistema: configura umbrales y gobierna el modelo.
- Equipo de desarrollo: historias técnicas que habilitan las demás.
- Docente evaluador: revisa los entregables.

**Cómo se aplica INVEST**

| Criterio | Aplicación en este backlog |
| --- | --- |
| Independiente | Cada historia se puede construir sin esperar a otra, salvo las dependencias del plan de sprints. |
| Negociable | Los criterios fijan el qué, no la herramienta: `pgmpy`, `XGBoost` o `fairlearn` se pueden cambiar si el resultado se mantiene. |
| Valiosa | Todas nombran un rol y un beneficio, incluidas las técnicas, y se ligan a un entregable del proyecto. |
| Estimable | Puntos de historia en escala Fibonacci (1, 2, 3, 5, 8). Referencia inicial: 1 punto ≈ medio día de una persona; se recalibra al cerrar el sprint 1. |
| Pequeña | Máximo 8 puntos y cabe en un sprint. |
| Verificable | Criterios en formato Dado / Cuando / Entonces con valores comprobables. |

**Prioridad (MoSCoW):** M = debe, S = debería, C = podría.

**Definition of Ready.** Una historia entra al sprint si tiene rol, beneficio, criterios, puntos, responsable y dependencias identificadas.

**Definition of Done.** Una historia se cierra cuando:

- Los criterios de aceptación se verificaron uno por uno.
- Otro integrante revisó el código o el texto y se integró a `main`.
- Las pruebas automáticas pasan.
- Las decisiones tomadas quedaron en la bitácora, para alimentar la metodología.
- Las fuentes consultadas están en el repositorio bibliográfico.

## Mapa de épicas

Siete épicas cubren todo lo que pide el enunciado: base de conocimiento, dataset sintético, tres motores de razonamiento, explicabilidad, paridad, auditoría ética, manual de gobierno y documentación.

| Épica | Qué entrega | Historias | Puntos | Responsable principal |
| --- | --- | --- | --- | --- |
| E1. Fundamentos y conocimiento | Repositorio, matriz de adquisición, ontología, variables y bibliografía | HU-01 a HU-05 | 18 | Dev 1 |
| E2. Datos y gobierno de datos | Dataset sintético con sesgo medible, diccionario, acta ética y consentimientos | HU-06 a HU-09 | 18 | Dev 2 y Dev 3 |
| E3. Modelos | Reglas expertas, red bayesiana y modelo ML | HU-10 a HU-16 | 31 | Dev 1 y Dev 2 |
| E4. Fusión, explicabilidad y API | Servicio FastAPI, puntaje único, semáforo y factores explicativos por alerta | HU-17 a HU-20 | 18 | Dev 4 y Dev 2 |
| E5. Equidad y auditoría ética | Métricas de paridad, mitigación, reporte de auditoría y manual de gobierno | HU-21 a HU-24 | 20 | Dev 3 |
| E6. Frontend React, validación y errores | Interfaz del analista en React, pruebas, validación con expertos y análisis de errores | HU-25 a HU-29 | 26 | Dev 4 |
| E7. Documentación y entrega | Documento APA 7, README, demo y revisión final | HU-30 a HU-37 | 33 | Dev 4 coordina; todos redactan |
| **Total** |  | **37** | **164** |  |

## Épica 1. Fundamentos y adquisición del conocimiento

Esta épica deja listo el terreno compartido: repositorio, conocimiento experto estructurado, ontología y reglas de equidad desde el diseño (18 puntos).

### HU-01 · Repositorio y estructura base

**Responsable:** Dev 4 · **Prioridad:** M · **Puntos:** 2 · **Sprint:** 1

Como equipo de desarrollo, quiero un repositorio GitHub con estructura y convenciones, para trabajar en paralelo sin pisarnos.

- Dado un repositorio nuevo, cuando se clona, entonces contiene `/data`, `/knowledge`, `/models`, `/fairness`, `/backend`, `/frontend` y `/docs`, y un README inicial.
- Dado que cada integrante trabaja en su rama, cuando abre un pull request, entonces otra persona debe revisarlo antes de integrarlo a `main`.
- Dado un entorno limpio, cuando se siguen las instrucciones, entonces el backend (FastAPI) y el frontend (React) se instalan y arrancan, cada uno con su propio comando.

### HU-02 · Matriz de adquisición del conocimiento

**Responsable:** Dev 1 · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 1

Como analista de crédito, quiero que mi criterio al revisar solicitudes quede registrado de forma estructurada, para que el sistema razone como un experto sin castigar la ruralidad.

- Dado el escenario del enunciado, cuando se termina la matriz, entonces recoge las 13 señales débiles (sin historial, vive lejos, sin local fijo, sin fiador, cédula de otra región, celular prepago, sin cuenta bancaria, factura manual, fotos poco convincentes, sin referencias comerciales, nombre distinto al del recibo, negocio pequeño para el monto, dirección sin georreferenciar) y los indicios fuertes (cédula alterada, ingresos inconsistentes, factura falsa, referencias falsas, historial adverso, negocio inconsistente).
- Cada fila registra fuente, técnica de adquisición, experto o documento, fecha y nivel de confianza.
- Cada señal débil trae anotada su explicación rural legítima (efectivo, ferias, prepago, estacionalidad).
- Hay al menos 2 entrevistas, reales o simuladas con docente o compañeros, con acta breve.

### HU-03 · Ontología del dominio de fraude

**Responsable:** Dev 1 · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 1

Como equipo de desarrollo, quiero una ontología del dominio, para que las reglas, la red bayesiana y el reporte usen los mismos conceptos.

- Dada la matriz de adquisición, cuando se modela, entonces la ontología define al menos Solicitante, Negocio, Documento, Referencia, Zona, Señal, Alerta, Regla y Decisión, con sus relaciones.
- Dado el formato de entrega, cuando se exporta, entonces queda en `/knowledge` en un formato legible (OWL/Turtle o JSON) más un diagrama.
- Dada cada variable del dataset, cuando se revisa, entonces corresponde a un concepto de la ontología.
- El diagrama queda listo como figura numerada, con título y nota en APA 7.

### HU-04 · Variables y grupos protegidos

**Responsable:** Dev 3, con Dev 2 · **Prioridad:** M · **Puntos:** 3 · **Sprint:** 1

Como auditor ético, quiero definir qué variables y grupos protegidos se medirán, para evaluar la equidad desde el diseño y no al final.

- Dado el escenario, cuando se define, entonces los grupos protegidos incluyen zona (rural/urbana), género y pertenencia étnica o campesina simulada.
- Cada variable queda clasificada como sensible, proxy potencial (por ejemplo, región de expedición de la cédula) o neutral.
- La decisión de usar o no las variables sensibles en el modelo, o solo en la auditoría, queda justificada por escrito.
- Dev 2 confirma que el generador de datos y el modelo respetan esa clasificación.

### HU-05 · Repositorio bibliográfico en APA 7

**Responsable:** Dev 4 · **Prioridad:** S · **Puntos:** 3 · **Sprint:** 1

Como equipo de desarrollo, quiero un repositorio compartido de fuentes, para armar el marco teórico y las referencias sin retrabajo.

- Dada una fuente leída, cuando se registra, entonces guarda autor, año, título, DOI o URL y la sección donde servirá.
- Hay al menos 2 fuentes por tema: IA y representación del conocimiento, ontologías, sistemas expertos, inferencia, ML y Deep Learning, ética y equidad, y marco legal.
- Dado el repositorio, cuando se exporta, entonces genera la lista en APA 7, en orden alfabético y con sangría francesa.
- Toda cita del documento tiene su entrada en el repositorio.

## Épica 2. Datos sintéticos y gobierno de datos

Esta épica produce el dataset sin datos reales, con un sesgo rural conocido que luego se puede medir y mitigar, y el marco ético y legal que lo respalda (18 puntos).

### HU-06 · Generador de solicitantes sintéticos

**Responsable:** Dev 2 · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 1

Como equipo de desarrollo, quiero un generador de solicitantes sintéticos, para entrenar y probar el sistema sin exponer datos de asociados reales.

- Dada una semilla fija, cuando se ejecuta el generador, entonces produce siempre el mismo dataset.
- Dado el escenario de CrediConfianza, cuando se genera, entonces crea entre 10.000 y 38.000 solicitantes con zona, género, grupo, tipo de actividad, ingresos, monto, historial, documentos y las 13 señales débiles.
- Las distribuciones reflejan el escenario: 14 oficinas (7 urbanas y 7 rurales), ingreso estacional rural, y los productos de consumo, microempresa, vivienda y agropecuario.
- Ningún registro contiene datos personales reales: nombres y cédulas son generados.

### HU-07 · Etiqueta de fraude y sesgo rural controlado

**Responsable:** Dev 2 · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 2

Como auditor ético, quiero que el dataset tenga un sesgo conocido entre zonas, para comprobar que el sistema lo detecta y lo mitiga.

- Dado el parámetro de tasa de fraude, cuando se genera, entonces `fraude_real` ronda entre 2 % y 5 % (configurable) y es similar en zona rural y urbana.
- Las señales débiles aparecen con más frecuencia en solicitantes rurales legítimos, y el exceso queda documentado con cifras (por ejemplo, porcentaje de celular prepago rural frente a urbano).
- Existe una versión de control del dataset sin sesgo inyectado, para comparar.
- Dada la etiqueta `fraude_real`, cuando se consulta, entonces solo la usan el entrenamiento y la evaluación, nunca el prototipo en producción.

### HU-08 · Diccionario de datos y validación del dataset

**Responsable:** Dev 2 · **Prioridad:** M · **Puntos:** 3 · **Sprint:** 2

Como equipo de desarrollo, quiero un dataset validado y documentado, para confiar en las métricas que salgan de él.

- Dado el dataset, cuando se valida, entonces no tiene nulos inesperados, los rangos son plausibles y las proporciones coinciden con los parámetros del generador.
- El diccionario de datos lista nombre, tipo, descripción, rango y concepto de la ontología de cada variable.
- Dada la partición entrenamiento, validación y prueba, cuando se genera, entonces está estratificada por fraude y zona, y se guarda con semilla.
- Hay una tabla resumen numerada, con título y nota, lista para el documento.

### HU-09 · Acta ética, consentimientos y marco legal

**Responsable:** Dev 3 · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 1

Como auditor ético, quiero el acta ética, el modelo de consentimiento y el análisis legal, para que el proyecto cumpla desde el primer día.

- Dado el uso de datos sintéticos o anonimizados, cuando se firma el acta, entonces declara el origen de los datos, la finalidad, la ausencia de datos personales reales y el compromiso de supervisión humana.
- El modelo de consentimiento queda listo antes de la primera entrevista a un experto o usuario (HU-02 y HU-28).
- El análisis legal cubre protección de datos personales, habeas data financiero, supervisión de cooperativas y decisiones automatizadas, con cada norma verificada en su texto vigente y citada en APA 7.
- Queda escrito el principio de que el sistema recomienda y la persona decide.

## Épica 3. Modelos: reglas, red bayesiana y aprendizaje automático

Esta épica construye los tres motores que el enunciado exige combinar, cada uno evaluable por separado (31 puntos).

### HU-10 · Base de reglas expertas

**Responsable:** Dev 1 · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 2

Como analista de crédito, quiero reglas expertas en un formato legible, para entender y corregir por qué se marca una alerta.

- Dada la matriz de adquisición, cuando se redacta la base, entonces tiene entre 20 y 30 reglas, cada una con ID, condición, peso, justificación, fuente y categoría (señal fuerte o débil).
- Dada una señal débil, cuando se escribe su regla, entonces incluye una condición de contexto que impide marcar sola a un solicitante legítimo (por ejemplo, "sin historial" en un caficultor rural no suma peso alto).
- Las reglas están en YAML o JSON en `/knowledge` y se validan contra un esquema.
- Otro integrante revisa la base, y Dev 3 comprueba que ninguna regla penaliza por sí sola a un grupo protegido.

### HU-11 · Motor de reglas con trazabilidad

**Responsable:** Dev 4, con Dev 1 · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 2

Como analista de crédito, quiero ver qué reglas se activaron en una solicitud, para justificar mi decisión.

- Dada una solicitud, cuando se evalúa, entonces devuelve las reglas activadas con ID, peso y justificación, y un subpuntaje de reglas entre 0 y 1.
- Dada una solicitud sin reglas activas, entonces devuelve 0 y una lista vacía.
- Dado un cambio en el archivo de reglas, cuando se recarga, entonces el motor lo aplica sin modificar el código.
- Cada regla tiene una prueba unitaria con un caso que la activa y otro que no.

### HU-12 · Estructura de la red bayesiana

**Responsable:** Dev 1 · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 2

Como analista de crédito, quiero un razonamiento que pondere las señales según el contexto, para que "sin historial" no pese igual en lo rural que en lo urbano.

- Dado el diseño, cuando se construye, entonces el grafo tiene nodos para fraude, zona, tipo de actividad, señales débiles y señales fuertes, con arcos justificados en la matriz de adquisición.
- La red modela que la zona y la actividad explican señales como el celular prepago sin implicar fraude.
- El grafo es acíclico y la librería lo valida sin errores.
- El diagrama queda como figura numerada para el documento.

### HU-13 · Parámetros e inferencia de la red

**Responsable:** Dev 1 · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 3

Como analista de crédito, quiero la probabilidad de fraude dada la evidencia disponible, para contar con un puntaje que maneje la incertidumbre.

- Dadas las tablas de probabilidad, cuando se definen, entonces combinan criterio experto (con su fuente) y estimaciones del dataset de entrenamiento, y cada valor indica de cuál de las dos viene.
- Dada una solicitud con evidencia parcial, cuando se consulta, entonces devuelve P(fraude | evidencia) entre 0 y 1 sin fallar por datos faltantes.
- Dado el mismo caso en zona rural y urbana, cuando se compara, entonces la probabilidad cambia de forma coherente con las tablas, y la prueba de sensibilidad queda documentada.
- La inferencia por solicitud tarda menos de 1 segundo.

### HU-14 · Línea base de aprendizaje automático

**Responsable:** Dev 2 · **Prioridad:** M · **Puntos:** 3 · **Sprint:** 2

Como equipo de desarrollo, quiero un modelo simple de referencia, para saber si el modelo avanzado realmente aporta.

- Dado el conjunto de entrenamiento, cuando se entrena una regresión logística, entonces se reportan AUC, F1, precisión y recall en validación.
- Dado el desbalance de clases, cuando se entrena, entonces se aplica ponderación o remuestreo y se documenta cuál.
- El modelo y sus métricas se guardan versionados en `/models`.

### HU-15 · Modelo principal y calibración

**Responsable:** Dev 2 · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 3

Como analista de crédito, quiero un puntaje estadístico confiable, para apoyarme en patrones que las reglas no capturan.

- Dado el conjunto de entrenamiento, cuando se entrena gradient boosting con validación cruzada, entonces supera a la línea base en AUC o se justifica por qué no.
- Las probabilidades salen calibradas, y el reporte incluye la curva de calibración y el puntaje de Brier.
- Hiperparámetros y semillas quedan registrados para reproducir el resultado.
- Las variables sensibles se tratan según la decisión de HU-04.

### HU-16 · Evaluación comparativa de los motores

**Responsable:** Dev 2 · **Prioridad:** M · **Puntos:** 3 · **Sprint:** 4

Como docente evaluador, quiero ver las métricas de cada motor por separado, para valorar qué aporta cada uno al sistema.

- Dada la partición de prueba, cuando se evalúa cada motor (reglas, red y ML), entonces se reportan AUC, F1, precisión, recall y tasa de falsos positivos.
- Las métricas se presentan en una tabla numerada con título y nota, junto con las matrices de confusión y el umbral usado.
- Las métricas se calculan solo con datos de prueba que no se usaron para ajustar ningún modelo.

## Épica 4. Fusión del puntaje y explicabilidad

Esta épica expone los tres motores como un servicio FastAPI y los convierte en una sola respuesta útil: un puntaje, un semáforo y las razones de cada alerta (18 puntos).

### HU-17 · Servicio FastAPI y contrato de la API

**Responsable:** Dev 4 · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 2

Como equipo de desarrollo, quiero un servicio FastAPI con un contrato de API acordado, para que los tres motores y el frontend React se integren sin sorpresas.

- Dado el servicio, cuando se inicia, entonces expone un endpoint de evaluación de solicitudes y genera automáticamente la documentación OpenAPI (Swagger).
- Los modelos Pydantic definen la entrada (datos de la solicitud) y la salida (puntaje, semáforo, reglas activadas, probabilidad de la red, probabilidad del ML, factores explicativos y versión del modelo).
- Dado cada motor, cuando responde con datos de ejemplo, entonces cumple el esquema desde el primer día de integración, y el frontend React puede desarrollarse contra esos ejemplos.
- Dada una petición desde el frontend, cuando llega desde otro puerto u origen, entonces el servicio la acepta solo si el origen está permitido en la configuración de CORS.
- Las pruebas validan el esquema, y Dev 1, Dev 2 y Dev 4 dejan constancia de que aceptan el contrato.

### HU-18 · Fusión de los tres motores en un puntaje de riesgo

**Responsable:** Dev 4 · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 3

Como analista de crédito, quiero un único puntaje de riesgo, para decidir sin interpretar tres resultados por separado.

- Dadas las salidas de los tres motores, cuando se fusionan, entonces el puntaje final queda entre 0 y 100, y la fórmula y los pesos están en un archivo de configuración.
- Dada cada una de las 13 señales débiles presentada de forma aislada, cuando se evalúa, entonces el caso nunca llega a rojo (prueba automatizada).
- Dado que un motor falla o no tiene datos, cuando se calcula el puntaje, entonces el sistema responde con los otros dos e informa cuál faltó.
- Se comparan al menos 2 estrategias de fusión (por ejemplo, promedio ponderado y regresión sobre las salidas), y la elegida queda justificada con métricas.

### HU-19 · Semáforo y umbrales configurables

**Responsable:** Dev 2, con Dev 4 · **Prioridad:** M · **Puntos:** 3 · **Sprint:** 3

Como administrador del sistema, quiero umbrales configurables, para ajustar el equilibrio entre falsos positivos y fraudes no detectados.

- Dado el puntaje, cuando se compara con los umbrales, entonces el caso queda en verde, amarillo (revisión del analista) o rojo (escalamiento al comité).
- Los umbrales salen de un análisis de costo del error y de las curvas de precisión y recall, y el análisis queda documentado.
- Cada cambio de umbral queda registrado con fecha, persona y motivo.
- Dado un cambio de umbral, cuando se aplica, entonces se recalculan las métricas de equidad de HU-21.

### HU-20 · Explicación de cada alerta

**Responsable:** Dev 2 · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 3

Como analista de crédito, quiero entender por qué un caso salió amarillo o rojo, para explicárselo al solicitante y al comité.

- Dada una alerta, cuando se consulta, entonces muestra al menos 3 factores explicativos ordenados por peso, que combinan reglas activadas, nodos de la red y factores SHAP.
- Las explicaciones usan lenguaje claro y, cuando aplica, señalan el contexto rural (por ejemplo, "sin historial: frecuente en productores que nunca accedieron al sistema financiero").
- El 100 % de las alertas amarillas y rojas del conjunto de prueba trae explicación.
- Las explicaciones se califican en claridad con expertos o usuarios en HU-28, con una meta de 4 sobre 5 de promedio.

## Épica 5. Equidad, auditoría ética y gobierno

Esta épica responde a la parte más exigente del enunciado: medir y mitigar la paridad entre grupos, auditar y gobernar el sistema (20 puntos).

### HU-21 · Métricas de equidad por grupo

**Responsable:** Dev 3 · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 3

Como auditor ético, quiero medir la paridad entre grupos, para saber si el sistema castiga a la ruralidad.

- Dada la partición de prueba, cuando se evalúa cada motor y el sistema combinado, entonces se reportan por zona, género y grupo étnico o campesino simulado: tasa de alertas, tasa de falsos positivos, recall, paridad demográfica, igualdad de oportunidad e impacto dispar.
- Los umbrales de referencia (diferencia de 0,1 o menos y razón de 0,8 o más) están en un archivo de configuración y se justifican como propuesta del equipo, sujeta a revisión del docente.
- Dado un grupo pequeño, cuando se calcula la métrica, entonces se incluye un intervalo de confianza para no concluir con muestras insuficientes.
- Los resultados quedan en tablas y figuras numeradas, con título y nota.

### HU-22 · Mitigación del sesgo y comparación antes y después

**Responsable:** Dev 3 · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 3

Como auditor ético, quiero reducir la brecha entre zonas, para que la cooperativa no excluya de hecho a los solicitantes rurales.

- Dado el sesgo detectado en HU-21, cuando se aplica al menos una técnica de mitigación (reponderación, umbrales por grupo o postprocesamiento), entonces se reportan las métricas de equidad y de desempeño antes y después.
- La brecha de falsos positivos entre zona rural y urbana baja frente a la versión sin mitigar; si no baja, el informe explica por qué.
- El costo de la mitigación en AUC y recall queda cuantificado.
- Si la técnica usa variables sensibles, se deja constancia y se revisa su viabilidad legal con el análisis de HU-09.

### HU-23 · Reporte de auditoría ética automático

**Responsable:** Dev 3 · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 4

Como auditor ético, quiero un reporte generado automáticamente desde el prototipo, para revisar equidad y cumplimiento sin armar tablas a mano.

- Dado un lote de solicitudes evaluadas, cuando se genera el reporte, entonces incluye volumen, distribución de semáforos por grupo, métricas de equidad, falsos positivos por grupo y versión del modelo y de las reglas.
- El reporte sale en PDF o HTML con fecha y versión.
- Incluye una lista de verificación de cumplimiento ético con el estado de cada ítem: transparencia, revisión humana, apelación, registro de decisiones, minimización de datos y equidad.
- Dada una métrica que supera el umbral de equidad, cuando se genera el reporte, entonces la marca de forma visible.

### HU-24 · Manual de gobierno del sistema

**Responsable:** Dev 3 · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 4

Como administrador del sistema, quiero un manual de gobierno, para saber quién decide, quién audita y cómo se corrige el sistema.

- Dado el manual, cuando se lee, entonces define roles y responsabilidades: analista, comité de riesgo, auditor ético, administrador y dueño del modelo.
- Define el ciclo de vida: aprobación de cambios en reglas, umbrales y modelos, frecuencia de reentrenamiento y de revisión de equidad, y criterios para retirar el modelo.
- Describe el procedimiento de apelación del solicitante y el registro de decisiones con trazabilidad.
- Incluye una matriz de riesgos éticos con mitigación y responsable.
- Lo revisa una persona distinta de quien lo redactó.

## Épica 6. Frontend React, validación y análisis de errores

Esta épica construye el frontend en React sobre el servicio FastAPI, prueba el sistema y recoge la evidencia de que funciona y de dónde falla (26 puntos).

### HU-25 · Frontend React: carga de solicitud y puntaje

**Responsable:** Dev 4 · **Prioridad:** M · **Puntos:** 8 · **Sprint:** 3

Como analista de crédito, quiero una aplicación web en React donde ingrese los datos de una solicitud y vea su puntaje y semáforo, para priorizar mi revisión.

- Dado el formulario React validado según el esquema de la API, cuando el analista envía una solicitud (o elige una del dataset), entonces la aplicación llama al servicio FastAPI y muestra el puntaje de 0 a 100 y el semáforo en menos de 3 segundos.
- Dada una solicitud con datos faltantes, cuando se envía, entonces la aplicación no la bloquea e indica qué dato falta y cómo afecta la incertidumbre.
- Dada la cola de casos, cuando se abre, entonces se ordena por riesgo y se puede filtrar por semáforo.
- Dado un error o una caída del servicio, cuando el analista envía una solicitud, entonces la interfaz muestra un mensaje claro y no pierde lo digitado.
- El frontend arranca localmente con un solo comando y se conecta al backend mediante una URL configurable por variable de entorno.

### HU-26 · Panel React de explicación y decisión del analista

**Responsable:** Dev 4, con Dev 2 · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 4

Como analista de crédito, quiero ver las razones de una alerta en la aplicación y registrar mi decisión, para que la persona siga al mando y quede trazabilidad.

- Dado un caso amarillo o rojo, cuando se abre su detalle en React, entonces muestra las reglas activadas, los factores SHAP y la probabilidad de la red, con el contexto rural cuando aplica.
- Dada una decisión (aprobar, pedir información adicional, escalar al comité o rechazar), cuando se registra desde la interfaz, entonces el backend FastAPI exige un motivo en texto y guarda fecha, usuario y versión del modelo.
- Dado que el analista discrepa del sistema, cuando lo indica, entonces el desacuerdo queda registrado para analizarlo después.
- Dado el código del backend, cuando se prueba, entonces ninguna ruta ejecuta una decisión final automática.

### HU-27 · Casos de referencia y pruebas automáticas

**Responsable:** Dev 1, con Dev 4 · **Prioridad:** S · **Puntos:** 5 · **Sprint:** 4

Como equipo de desarrollo, quiero casos de referencia y pruebas automáticas, para detectar errores al integrar y para demostrar el comportamiento esperado.

- Existen al menos 3 casos de referencia con resultado esperado: un rural legítimo con varias señales débiles (verde o amarillo, nunca rojo), un urbano fraudulento con señales fuertes (rojo) y uno ambiguo (amarillo).
- Las pruebas del backend (pytest con el cliente de pruebas de FastAPI) cubren los motores, la fusión y el esquema de la API, y las del frontend (por ejemplo, Vitest con React Testing Library) cubren el formulario y el panel de explicación; cada conjunto corre con un solo comando.
- Dado un pull request, cuando se abre, entonces la integración continua ejecuta ambos conjuntos de pruebas y bloquea la integración si fallan.
- La cobertura mínima de la lógica la fija el equipo (propuesta: 70 %).

### HU-28 · Validación con expertos y usuarios

**Responsable:** Dev 1 y Dev 3 · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 4

Como docente evaluador, quiero evidencia de que el sistema es útil y comprensible, para valorar su calidad más allá de las métricas.

- Dados al menos 3 validadores (analistas, docente o compañeros en rol de analista), cuando prueban los casos de referencia, entonces responden un cuestionario de utilidad, claridad de la explicación, confianza y equidad percibida, en escala de 1 a 5.
- Cada validador firma antes el consentimiento de HU-09.
- Los resultados se resumen en una tabla con promedios y comentarios, y se anotan los cambios hechos a partir de ellos.
- Si la claridad de las explicaciones queda por debajo de 4 sobre 5, se documenta un plan de mejora.

### HU-29 · Análisis de errores

**Responsable:** Dev 2 · **Prioridad:** M · **Puntos:** 3 · **Sprint:** 4

Como auditor ético, quiero entender dónde y por qué falla el sistema, para documentar limitaciones y priorizar mejoras.

- Dado el conjunto de prueba, cuando se revisan los falsos positivos y los falsos negativos, entonces se analiza una muestra de al menos 20 casos de cada tipo (o todos si hay menos) y se clasifican por causa: regla, red, ML o fusión.
- El análisis se desglosa por zona, género y grupo.
- Se identifican las señales débiles que más falsos positivos rurales generan.
- Los hallazgos alimentan las limitaciones de la discusión y las recomendaciones.

## Épica 7. Documentación, repositorio y demo

Esta épica cubre los entregables de la estructura obligatoria: documento PDF en APA 7, repositorio con README, demo de 10 a 15 minutos y revisión final (33 puntos). El póster quedó fuera del alcance. Se redacta en paralelo al desarrollo para no dejar todo al final.

### HU-30 · Plantilla APA 7 y secciones iniciales

**Responsable:** Dev 4, con Dev 3 · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 1

Como docente evaluador, quiero que el documento abra con el contexto, el problema y los objetivos claros, para entender qué resuelve el proyecto.

- Dada la plantilla, cuando se abre, entonces aplica Times New Roman 12 (o Arial 11), márgenes de 2,54 cm, sangría de 1,27 cm, interlineado intermedio y títulos en estilo APA.
- La portada incluye título, autores, facultad, departamento, curso, docente y fecha.
- La introducción tiene al menos 2 párrafos coherentes, y el planteamiento recoge contexto, pregunta orientadora y delimitación (estudio de crédito y marco legal).
- La justificación está escrita, y los objetivos son 2 generales y 3 específicos, medibles y con verbo en infinitivo.
- Toda cita autor–fecha tiene su entrada en la lista de referencias.

### HU-31 · Marco teórico y metodología

**Responsable:** Dev 1, Dev 2 y Dev 3 (cada uno su parte); Dev 4 consolida · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 2

Como docente evaluador, quiero un marco teórico y una metodología fundamentados, para valorar el rigor conceptual del proyecto.

- Dado el marco teórico, cuando se revisa, entonces cubre IA, representación del conocimiento, ontologías, sistemas expertos, inferencia, ML y Deep Learning, y ética, con citas autor–fecha.
- Cada tema se apoya en al menos 2 fuentes del repositorio de HU-05, y cada integrante redacta el tema que construye.
- La metodología describe el ABP o ABPr aplicado, la adquisición del conocimiento, el diseño del artefacto y la validación, con las decisiones de la bitácora.
- Ningún pasaje queda copiado: todo se parafrasea o se cita con comillas y referencia.

### HU-32 · Desarrollo del artefacto

**Responsable:** Todos; Dev 4 consolida · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 4

Como docente evaluador, quiero ver cómo está construido el sistema, para valorar las decisiones de diseño.

- Dada la sección, cuando se lee, entonces describe la arquitectura (con diagrama), la base de conocimiento, la ontología, las reglas, la red bayesiana, el modelo ML, la fusión, el servicio FastAPI y el frontend React.
- Cada figura y tabla está numerada, con título y nota, y remite a los anexos cuando corresponde.
- Cada decisión de diseño incluye su justificación y las alternativas descartadas.
- Las reglas y la ontología completas van en anexos; en el cuerpo solo un resumen.

### HU-33 · Resultados y discusión

**Responsable:** Dev 2 y Dev 3 · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 5

Como docente evaluador, quiero ver los resultados y su análisis crítico, para valorar el cumplimiento de los resultados de aprendizaje.

- Dados los resultados, cuando se presentan, entonces incluyen pruebas, métricas (AUC, F1, precisión, recall, falsos positivos y paridad), validación con expertos y análisis de errores, tomados de HU-16, HU-21, HU-22, HU-28 y HU-29.
- La discusión relaciona los resultados con RA y R1 a R6 en una matriz, según la rúbrica que entregue el docente.
- La discusión trata ética, sesgos, limitaciones (datos sintéticos, generalización a datos reales) y amenazas a la validez.
- Toda métrica que no alcanzó la meta se declara, con su explicación.

### HU-34 · Conclusiones, resumen, referencias y anexos

**Responsable:** Dev 4 · **Prioridad:** M · **Puntos:** 5 · **Sprint:** 5

Como docente evaluador, quiero un cierre completo y verificable, para comprobar que se cumplieron los objetivos.

- Dadas las conclusiones, cuando se leen, entonces responden a cada objetivo y van separadas de las recomendaciones.
- El resumen tiene entre 150 y 250 palabras, con conteo verificado, y de 3 a 5 palabras clave.
- Las referencias siguen APA 7, en orden alfabético, con sangría francesa y DOI o URL cuando existan, sin entradas sin cita ni citas sin entrada.
- Los anexos incluyen la matriz de adquisición, las reglas, la ontología, el código (con enlace al repositorio), los consentimientos, los datos sintéticos o anonimizados y el acta ética.

### HU-35 · README y repositorio final

**Responsable:** Dev 4 · **Prioridad:** M · **Puntos:** 2 · **Sprint:** 5

Como docente evaluador, quiero ejecutar el prototipo desde el repositorio, para comprobar que funciona.

- Dado el README, cuando alguien ajeno al equipo lo sigue en una máquina limpia, entonces instala y ejecuta el backend FastAPI y el frontend React sin ayuda.
- El README explica propósito, estructura de carpetas, instalación y ejecución de backend y frontend, variables de entorno, datos y uso responsable.
- El repositorio contiene el dataset sintético, el código, los modelos, las reglas, la ontología y el acta ética, y no contiene datos reales ni credenciales.
- La versión de entrega queda marcada con una etiqueta (tag) y el código se congela antes del ensayo final.

### HU-36 · Demo de 10 a 15 minutos

**Responsable:** Dev 4, con todos · **Prioridad:** M · **Puntos:** 3 · **Sprint:** 5

Como docente evaluador, quiero una demo clara del flujo completo, para ver el sistema funcionando.

- Dado el guion, cuando se ensaya completo y cronometrado, entonces dura entre 10 y 15 minutos y sigue el esquema presentado en clase.
- El guion recorre el problema, la arquitectura, un caso rural legítimo, un caso fraudulento, la equidad antes y después de mitigar, el reporte de auditoría y el gobierno.
- Existe un plan B (video grabado o capturas) por si falla la conectividad.
- Cada integrante expone una parte.

### HU-37 · Revisión final de formato, similitud y coherencia

**Responsable:** Dev 4, con todos · **Prioridad:** M · **Puntos:** 3 · **Sprint:** 5

Como docente evaluador, quiero un documento sin plagio, con el formato pedido y completo, para evaluarlo sin objeciones.

- Dado el documento, cuando se pasa por una herramienta de similitud, entonces todo pasaje señalado se reescribe o se cita.
- Dada la lista de verificación de los 15 puntos de la estructura obligatoria, cuando se revisa, entonces todos están presentes y en orden.
- El formato APA 7 se verifica: fuente, márgenes, interlineado, sangría, títulos, y tablas y figuras numeradas con título y nota.
- Cada sección la lee una persona que no la escribió, y el PDF final se exporta y se abre para comprobarlo.

## Plan de sprints, dependencias y riesgos

El sprint 3 es el más cargado (41 puntos) porque ahí se juntan los tres motores, la fusión y la equidad; conviene protegerlo de cambios de alcance.

| Sprint | Semanas | Objetivo | Historias | Puntos |
| --- | --- | --- | --- | --- |
| 1 | 1–2 | Base compartida: conocimiento, ética y datos iniciales | HU-01 a HU-06, HU-09, HU-30 | 33 |
| 2 | 3–4 | Primeros motores y servicio FastAPI con su contrato | HU-07, HU-08, HU-10, HU-11, HU-12, HU-14, HU-17, HU-31 | 36 |
| 3 | 5–6 | Modelos completos, fusión, equidad y frontend React inicial | HU-13, HU-15, HU-18, HU-19, HU-20, HU-21, HU-22, HU-25 | 41 |
| 4 | 7–8 | Evaluación, auditoría, gobierno, validación y análisis de errores | HU-16, HU-23, HU-24, HU-26 a HU-29, HU-32 | 36 |
| 5 | 9–10 | Cierre: resultados, entregables y revisión final | HU-33 a HU-37 | 18 |
| **Total** |  |  | **37 historias** | **164** |

**Dependencias principales**

| Historia | Depende de | Motivo |
| --- | --- | --- |
| HU-03, HU-04, HU-10 | HU-02 | La ontología, las variables y las reglas salen de la matriz de adquisición. |
| HU-06, HU-07 | HU-04 | El generador necesita saber qué variables y grupos protegidos medir. |
| HU-11 | HU-10, HU-17 | El motor lee las reglas y responde con el esquema de la API. |
| HU-12 | HU-02, HU-03 | Los nodos de la red usan los conceptos de la ontología. |
| HU-13, HU-14, HU-15 | HU-08 | Los modelos se ajustan con el dataset validado y su partición. |
| HU-16 | HU-11, HU-13, HU-15 | Compara los tres motores ya terminados. |
| HU-18 | HU-11, HU-13, HU-15, HU-17 | La fusión necesita la salida de los tres motores. |
| HU-20 | HU-11, HU-13, HU-15 | Las explicaciones combinan reglas, red y SHAP. |
| HU-21 | HU-08, HU-14 | Mide equidad desde el primer modelo disponible. |
| HU-22, HU-23 | HU-18, HU-19, HU-21 | Mitiga y reporta sobre el sistema combinado. |
| HU-26 | HU-20, HU-25 | El panel se apoya en las explicaciones y la interfaz base. |
| HU-28 | HU-09, HU-26, HU-27 | Los validadores firman el consentimiento y prueban los casos de referencia. |
| HU-33 | HU-16, HU-21, HU-22, HU-28, HU-29 | Los resultados salen de esas historias. |

**Riesgos y mitigación**

| Riesgo | Mitigación | Responsable |
| --- | --- | --- |
| No hay acceso a analistas reales para la matriz de adquisición | Usar el escenario como fuente, entrevistas simuladas con docente o compañeros, y declararlo como limitación | Dev 1 |
| El dataset sintético queda demasiado fácil y el AUC sale cercano a 1 | Agregar ruido y solapamiento entre clases, conservar la versión de control y reportar con honestidad | Dev 2 |
| La mitigación no reduce la brecha rural–urbana | Documentar el resultado y analizarlo; un resultado negativo bien explicado también es válido | Dev 3 |
| Los tres motores se integran tarde y fallan | Contrato de API con datos de ejemplo desde el sprint 2 | Dev 4 |
| Dev 4 concentra integración y documentación | Revisar la carga en cada planeación y repartir HU-34 a HU-37 con los demás | Todos |
| La rúbrica de RA y R1 a R6, o el esquema de presentación, llegan tarde | Pedirlos al docente en el sprint 1; bloquean HU-33 y HU-36 | Dev 4 |
| Normas legales desactualizadas en el documento | Verificar el texto vigente y anotar la fecha de consulta de cada norma | Dev 3 |
| Pasajes copiados o mal parafraseados | Revisión cruzada y herramienta de similitud en HU-37 | Todos |

Quedan tres datos del docente por confirmar para fijar fechas y criterios: la fecha de entrega, la rúbrica de RA y R1 a R6, y el esquema de presentación visto en clase.
