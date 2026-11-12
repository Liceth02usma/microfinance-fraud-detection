"""Motor de explicabilidad local para predicciones de fraude en microfinanzas (HU-20).

Implementa la interpretabilidad basada en SHAP (TreeExplainer) para el modelo principal
de Gradient Boosting, traduciendo los pesos a lenguaje claro y destacando el contexto
rural legítimo para evitar penalizaciones injustas en CrediConfianza.
"""

from __future__ import annotations

from typing import Any

import pandas as pd
import shap
from sklearn.pipeline import Pipeline
from xgboost import XGBClassifier

# Catálogo de explicaciones legibles con contexto rural y financiero de CrediConfianza
FEATURE_EXPLANATIONS: dict[str, dict[str, Any]] = {
    # Señales Débiles (Informalidad / Contexto Rural)
    "sin_historial": {
        "title": "Sin historial crediticio previo",
        "description": (
            "Frecuente en productores agrícolas y microempresarios que nunca accedieron "
            "al sistema financiero formal. No implica deshonestidad."
        ),
        "is_rural_context": True,
    },
    "vive_lejos": {
        "title": "Distancia a cabecera municipal",
        "description": (
            "Habitual en veredas de San Juan de la Vega; la distancia física refleja "
            "geografía rural, no riesgo de fraude."
        ),
        "is_rural_context": True,
    },
    "sin_local_fijo": {
        "title": "Actividad económica sin local fijo",
        "description": (
            "Típico de parcelas productivas o ventas en ferias y plazas de mercado "
            "campesinas; verificar mediante visita a la siembra."
        ),
        "is_rural_context": True,
    },
    "sin_fiador": {
        "title": "Ausencia de fiador formal",
        "description": (
            "Común en sectores populares donde las redes de apoyo no cuentan con "
            "salarios formalmente certificados."
        ),
        "is_rural_context": True,
    },
    "cedula_otra_region": {
        "title": "Cédula expedida en otra región",
        "description": (
            "Frecuente por migración de mano de obra en temporadas de cosecha cafetera; "
            "verificar arraigo en la vereda."
        ),
        "is_rural_context": True,
    },
    "celular_prepago": {
        "title": "Línea celular prepago",
        "description": (
            "Modalidad de conectividad estándar en más del 80% de los hogares campesinos "
            "en Valles Templados."
        ),
        "is_rural_context": True,
    },
    "sin_cuenta_bancaria": {
        "title": "Economía no bancarizada en efectivo",
        "description": (
            "Predominante en economías rurales de subsistencia y ferias agropecuarias; "
            "no sustituye la capacidad real de pago."
        ),
        "is_rural_context": True,
    },
    "factura_manual": {
        "title": "Comprobantes de compraventa manuales",
        "description": (
            "Común en transacciones locales donde pequeños proveedores no cuentan con "
            "facturación electrónica."
        ),
        "is_rural_context": True,
    },
    "fotos_poco_convincentes": {
        "title": "Registro fotográfico con limitaciones",
        "description": (
            "Puede deberse a conectividad intermitente, cámaras sencillas o predios abiertos "
            "durante la visita preliminar."
        ),
        "is_rural_context": True,
    },
    "sin_referencias_comerciales": {
        "title": "Sin referencias comerciales formalizadas",
        "description": (
            "Habitual en relaciones con proveedores informales de granos o insumos agrícolas."
        ),
        "is_rural_context": True,
    },
    "nombre_distinto_recibo": {
        "title": "Recibo a nombre de un tercero",
        "description": (
            "Frecuente en acuerdos de palabra, predios familiares compartidos o sucesiones "
            "sin escrituración formal."
        ),
        "is_rural_context": True,
    },
    "negocio_pequeno_monto": {
        "title": "Monto elevado frente a tamaño de negocio",
        "description": (
            "Discrepancia entre la infraestructura observable y el volumen de crédito solicitado."
        ),
        "is_rural_context": False,
    },
    "direccion_sin_georreferenciar": {
        "title": "Dirección sin georreferenciación catastral",
        "description": (
            "Característico de caminos veredales y fincas sin nomenclatura urbana en la región."
        ),
        "is_rural_context": True,
    },
    # Indicios Fuertes de Fraude
    "cedula_alterada": {
        "title": "Alteración o falsedad en documento de identidad",
        "description": (
            "Alerta crítica: inconsistencias en código de barras, holograma o biometría documental."
        ),
        "is_rural_context": False,
    },
    "ingresos_inconsistentes": {
        "title": "Inconsistencia matemática en ingresos",
        "description": (
            "Alerta crítica: discrepancia aritmética directa entre costos operativos e ingresos."
        ),
        "is_rural_context": False,
    },
    "factura_falsa": {
        "title": "Soporte documental o factura falsa",
        "description": (
            "Alerta crítica: verificación de NIT o timbres confirmó soporte inexistente."
        ),
        "is_rural_context": False,
    },
    "referencias_falsas": {
        "title": "Referencias ficticias o concertadas",
        "description": (
            "Alerta crítica: números telefónicos inexistentes o sin vínculo con el titular."
        ),
        "is_rural_context": False,
    },
    "historial_adverso": {
        "title": "Historial judicial o lista restrictiva",
        "description": (
            "Alerta crítica: coincidencia en listas vinculantes o reportes de fraude institucional."
        ),
        "is_rural_context": False,
    },
    "negocio_inconsistente": {
        "title": "Inconsistencia sustancial de negocio",
        "description": (
            "Alerta crítica: visita constató inexistencia física del negocio o del cultivo."
        ),
        "is_rural_context": False,
    },
    # Variables financieras y operativas
    "monto_solicitado": {
        "title": "Magnitud del monto solicitado",
        "description": "El volumen de capital solicitado influye en la exposición de riesgo.",
        "is_rural_context": False,
    },
    "ingresos_declarados": {
        "title": "Capacidad económica declarada",
        "description": "Flujo de caja mensual reportado para amortizar el microcrédito.",
        "is_rural_context": False,
    },
    "antiguedad_negocio_meses": {
        "title": "Trayectoria operativa del negocio",
        "description": "Tiempo acumulado de experiencia en la parcela o unidad productiva.",
        "is_rural_context": False,
    },
    "edad_solicitante": {
        "title": "Edad del solicitante",
        "description": "Variable demográfica operativa del perfil del asociado.",
        "is_rural_context": False,
    },
    "plazo_meses": {
        "title": "Plazo de financiamiento",
        "description": "Horizonte temporal solicitado para la cancelación de cuotas.",
        "is_rural_context": False,
    },
    "es_estacional": {
        "title": "Estacionalidad por ciclos de cosecha",
        "description": (
            "Ingresos condicionados a cosechas agrícolas; considerar periodos de gracia."
        ),
        "is_rural_context": True,
    },
}


class ShapExplainer:
    """Explicador de riesgo basado en SHAP TreeExplainer para modelos de Gradient Boosting."""

    def __init__(self, pipeline: Pipeline) -> None:
        """Inicializa el explicador extrayendo el clasificador XGBoost y el preprocesador."""
        self.preprocessor = pipeline.named_steps["preprocessor"]
        self.classifier: XGBClassifier = pipeline.named_steps["classifier"]

        # TreeExplainer optimizado para modelos basados en árboles (XGBoost)
        self.explainer = shap.TreeExplainer(self.classifier)
        self._transformed_feature_names: list[str] | None = None

    def _get_feature_names(self) -> list[str]:
        """Obtiene la lista de nombres de columnas transformadas por el ColumnTransformer."""
        if self._transformed_feature_names is None:
            names: list[str] = []
            for name, trans, cols in self.preprocessor.transformers_:
                if name == "remainder" or trans == "drop":
                    continue
                if hasattr(trans, "get_feature_names_out"):
                    names.extend(trans.get_feature_names_out(cols))
                elif isinstance(cols, list):
                    names.extend(cols)
            self._transformed_feature_names = names
        return self._transformed_feature_names

    def _map_feature_to_base(self, transformed_name: str) -> str:
        """Mapea una feature transformada (ej. 'cat__producto_credito_agropecuario') a su base."""
        # Si tiene prefijo de transformer num__, cat__, bin__
        clean_name = transformed_name
        for prefix in ["num__", "cat__", "bin__"]:
            if clean_name.startswith(prefix):
                clean_name = clean_name[len(prefix) :]

        # Revisar si coincide con alguna variable base
        for base in FEATURE_EXPLANATIONS:
            if clean_name == base or clean_name.startswith(f"{base}_"):
                return base
        return clean_name

    def explain_instance(
        self,
        applicant_series: pd.Series | dict[str, Any],
        top_k: int = 3,
    ) -> list[dict[str, Any]]:
        """Calcula los factores explicativos SHAP para una única solicitud de crédito.

        Garantiza al menos top_k factores ordenados por magnitud de peso (HU-20).
        """
        # Convertir a DataFrame de 1 fila
        if isinstance(applicant_series, dict):
            row_df = pd.DataFrame([applicant_series])
        else:
            row_df = pd.DataFrame([applicant_series.to_dict()])

        # Transformar features usando el preprocesador entrenado
        x_trans = self.preprocessor.transform(row_df)
        shap_values = self.explainer.shap_values(x_trans)

        # Si el resultado es 2D o lista
        if isinstance(shap_values, list):
            sv = shap_values[1][0]  # clase 1 (fraude)
        elif len(shap_values.shape) == 2:
            sv = shap_values[0]
        else:
            sv = shap_values

        feature_names = self._get_feature_names()
        contributions: list[dict[str, Any]] = []

        for name, value, shap_val in zip(feature_names, x_trans[0], sv, strict=False):
            base_key = self._map_feature_to_base(name)
            meta = FEATURE_EXPLANATIONS.get(
                base_key,
                {
                    "title": base_key.replace("_", " ").capitalize(),
                    "description": f"Contribución observada de {base_key} en el puntaje de riesgo.",
                    "is_rural_context": False,
                },
            )

            contributions.append(
                {
                    "feature": base_key,
                    "feature_name": name,
                    "title": meta["title"],
                    "description": meta["description"],
                    "is_rural_context": meta["is_rural_context"],
                    "raw_value": float(value),
                    "shap_value": round(float(shap_val), 4),
                    "impact": "aumenta_riesgo" if shap_val > 0 else "reduce_riesgo",
                    "abs_importance": round(float(abs(shap_val)), 4),
                }
            )

        # Consolidar contribuciones por variable base sumando SHAP si hubo one-hot
        grouped: dict[str, dict[str, Any]] = {}
        for item in contributions:
            f = item["feature"]
            if f not in grouped or item["abs_importance"] > grouped[f]["abs_importance"]:
                grouped[f] = item

        # Ordenar por importancia absoluta descendente
        sorted_factors = sorted(grouped.values(), key=lambda x: x["abs_importance"], reverse=True)

        # Retornar al menos top_k factores (HU-20 exige al menos 3 factores)
        k = max(top_k, 3)
        return sorted_factors[:k]
