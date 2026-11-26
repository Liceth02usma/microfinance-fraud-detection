# Reporte de auditoría ética — CrediConfianza

Generado: 2026-11-26T16:49:57+00:00 · Modelo: `1.0.0-gradient-boosting-calibrated` · Fusión: `1.0.0`

Fuente: backend/scripts/export_metrics.py sobre data/test.csv (datos sintéticos). Split de prueba: 2250 solicitudes (79 fraudes; 1132 rurales).

## Comparación de configuraciones (ablación)

| Configuración | AUC | Precisión | Recall | F1 | FPR rural | FPR urbana |
|---|---|---|---|---|---|---|
| Lista de chequeo manual (simulada) | — | 0.042 | 1.000 | 0.081 | 100.00 % | 65.43 % |
| Solo reglas expertas | 0.997 | 0.627 | 1.000 | 0.771 | 3.29 % | 1.02 % |
| Solo red bayesiana | 0.996 | 0.971 | 0.835 | 0.898 | 0.18 % | 0.00 % |
| Regresión logística (línea base ML) | 0.996 | 0.524 | 0.949 | 0.676 | 2.65 % | 3.62 % |
| Solo XGBoost calibrado | 0.997 | 0.815 | 0.835 | 0.825 | 0.55 % | 0.84 % |
| Sistema híbrido (reglas + bayes + ML) | 0.997 | 0.970 | 0.823 | 0.890 | 0.18 % | 0.00 % |

## Solicitantes legítimos enviados a revisión

- Lista de chequeo simulada: rural 100.0 %, urbana 65.4 %.
- Sistema híbrido (amarillo o rojo): rural 3.3 %, urbana 3.7 %.

## Tasa de falsos positivos por grupo (alerta roja, IC 95 % de Wilson)

| Variable | Grupo | n | FP | FPR | IC 95 % |
|---|---|---|---|---|---|
| tipo_zona | rural | 1132 | 2 | 0.18 % | 0.05 % – 0.66 % |
| tipo_zona | urbana | 1118 | 0 | 0.00 % | 0.00 % – 0.36 % |
| genero | femenino | 1082 | 1 | 0.10 % | 0.02 % – 0.54 % |
| genero | masculino | 1132 | 1 | 0.09 % | 0.02 % – 0.52 % |
| genero | otro | 36 | 0 | 0.00 % | 0.00 % – 9.89 % |
| pertenencia_etnica | afrodescendiente | 267 | 1 | 0.39 % | 0.07 % – 2.15 % |
| pertenencia_etnica | campesino | 538 | 0 | 0.00 % | 0.00 % – 0.74 % |
| pertenencia_etnica | indigena | 140 | 1 | 0.72 % | 0.13 % – 3.99 % |
| pertenencia_etnica | ninguno | 1305 | 0 | 0.00 % | 0.00 % – 0.30 % |

## Paridad entre grupos (fairlearn)

| Variable | Diferencia de paridad demográfica | Diferencia de Equalized Odds |
|---|---|---|
| tipo_zona | 0.0030 | 0.0225 |
| genero | 0.0036 | 0.1951 |
| pertenencia_etnica | 0.0100 | 0.2500 |

## Sugerencia de umbral

Se escanearon umbrales 30–90 (paso 5) minimizando la brecha |FPR_rural − FPR_urbana| sobre el split de prueba. El umbral sugerido (40) reduce la brecha de 0.0018 a 0.0001. NO se aplica automáticamente: registrar en la bitácora de cambios (fecha, persona, motivo) y recomputar esta auditoría.

## Limitaciones

- Los datos son sintéticos: las cifras validan el diseño, no el desempeño en producción.
- El fraude del generador depende sobre todo de los indicios fuertes, por eso el AUC es casi perfecto; con datos reales se espera un desempeño menor.
- Con pocos falsos positivos por grupo, los intervalos de confianza son amplios.
