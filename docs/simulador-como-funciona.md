# Simulador de Inferencia Híbrida — Cómo funciona

## Propósito

El Simulador permite a analistas y auditores explorar cómo el sistema CrediConfianza evalúa solicitudes de crédito antes de conectar el backend real. Funciona con datos de prueba interceptados por MSW (Mock Service Worker), lo que garantiza que el frontend sea verificable de forma aislada.

---

## Interfaz de tres columnas

| Columna | Componente | Función |
|---------|-----------|---------|
| **Parámetros** | `Col1Parametros` | Captura la solicitud: zona, género, señales débiles (13) e indicadores fuertes (6), sliders de monto/ingresos/plazo/edad y botones de escenario rápido. |
| **Motor simbólico** | `Col2Reglas` | Muestra las 24 reglas expertas (13 débiles, 6 fuertes, 3 salvaguardas, 2 sesgo) con resaltado en tiempo real según el estado del formulario, sin esperar la evaluación. |
| **Resultado** | `Col3Resultado` | Presenta el semáforo (verde / amarillo / rojo), el marcador 0–100, el desglose de los tres motores, los factores explicativos y la traza de razonamiento. |

---

## Flujo de datos

```
Usuario marca señales → FormState (React state)
  │
  ├─► Col2Reglas: resalta reglas activas (cliente, determinista)
  │
  └─► "Evaluar solicitud" → buildRequest(FormState) → EvaluationRequest
                              │
                         apiClient.evaluate()
                              │
                        MSW intercepta (si VITE_USE_MOCKS=true)
                              │
                        resolveScenario(request) → mock response
                              │
                         EvaluationResponse → Col3Resultado
```

---

## Escenarios de referencia (HU-27)

| Escenario | Señales cargadas | Mock devuelve |
|-----------|-----------------|--------------|
| **Rural legítimo** | 8 débiles (sw-1,2,3,4,6,7,8,13), 0 fuertes, zona rural | ✅ Verde · Score 12 |
| **Urbano fraudulento** | 3 fuertes (sf-1,2,3) + 2 débiles, zona urbana | 🔴 Rojo · Score 95 |
| **Ambiguo** | 1 fuerte (sf-2) + 5 débiles, zona rural | 🟡 Amarillo · Score 45 |

El mock `resolveScenario` detecta el escenario automáticamente contando `strongCount` y `weakCount` en el body de la petición; no requiere un parámetro explícito.

---

## Garantía ética HU-18

La barra de salvaguarda en Col1 evalúa en el cliente: si `strongCount === 0` y la zona es `rural`, la etiqueta cambia a **"Salvaguarda rural activa"** y el sistema garantiza que el mock (y en producción, el motor híbrido) devuelva `verde` o `amarillo`, **nunca `rojo`**. Este invariante está cubierto por un test unitario en el backend.

---

## Activación de los mocks

Crear `.env.local` en `frontend/` con:

```env
VITE_USE_MOCKS=true
```

Luego ejecutar:

```bash
npm run dev
```

Navegar a `http://localhost:5173/simulador`.
