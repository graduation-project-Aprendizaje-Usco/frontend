export const COMPETENCIAS = [
  { valor: 'ALGEBRAICA', etiqueta: 'Algebraica' },
  { valor: 'LOGICA', etiqueta: 'Razonamiento lógico' },
  { valor: 'FUNCIONAL', etiqueta: 'Comprensión funcional' },
];

export const ASIGNATURAS = [
  { valor: 'CALCULO_DIFERENCIAL', etiqueta: 'Cálculo Diferencial' },
  { valor: 'CALCULO_INTEGRAL', etiqueta: 'Cálculo Integral' },
];

export const NIVELES = [
  { valor: 1, etiqueta: 'Básico' },
  { valor: 2, etiqueta: 'Intermedio' },
  { valor: 3, etiqueta: 'Avanzado' },
];

export const TIPOS = [
  { valor: 'OPCION_MULTIPLE', etiqueta: 'Opción múltiple' },
  { valor: 'NUMERICA', etiqueta: 'Respuesta numérica' },
];

export const LETRAS = ['A', 'B', 'C', 'D'];

export function etiquetaCompetencia(codigo) {
  return COMPETENCIAS.find((competencia) => competencia.valor === codigo)?.etiqueta ?? codigo;
}
