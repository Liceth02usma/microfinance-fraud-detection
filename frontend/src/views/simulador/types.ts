import type {
  Genero,
  PertenenciaEtnica,
  ProductoCredito,
  TipoNegocio,
  TipoZona,
} from "../../api/types/evaluation.types";

export interface FormState {
  zona: TipoZona;
  genero: Genero;
  pertenenciaEtnica: PertenenciaEtnica;
  producto: ProductoCredito;
  tipoNegocio: TipoNegocio;
  esEstacional: boolean;
  monto: number;
  ingresos: number;
  plazo: number;
  edad: number;
  weak: boolean[]; // length 13, índice = señal débil 1-13
  strong: boolean[]; // length 6, índice = indicador fuerte 1-6
}
