/**
 * Formateadores seguros para los datos numéricos y estados del progreso.
 * Manejan valores nulos según las reglas de negocio (null no es 0%).
 */

export const NIVEL_ETIQUETAS = {
  INICIAL: 'Inicial',
  BASICO: 'Básico',
  INTERMEDIO: 'Intermedio',
  AVANZADO: 'Avanzado',
  SIN_EVALUAR: 'Pendiente de evaluación',
};

export const ESTADO_VARIACION = {
  MEJORA: { etiqueta: 'Mejora', color: 'success' },
  RETROCESO: { etiqueta: 'Retroceso', color: 'error' },
  SIN_CAMBIO: { etiqueta: 'Sin cambio', color: 'info' },
  DIAGNOSTICO_PENDIENTE: { etiqueta: 'Diagnóstico pendiente', color: 'secondary' },
  PRACTICA_PENDIENTE: { etiqueta: 'Práctica pendiente', color: 'secondary' },
};

/**
 * Formatea un porcentaje numérico o null.
 * @param {number|null|undefined} valor
 * @returns {string}
 */
export function formatearPorcentaje(valor) {
  if (valor === null || valor === undefined) {
    return 'Sin evaluar';
  }
  return `${Math.round(Number(valor))} %`;
}

/**
 * Formatea el nivel general de dominio.
 * @param {string|null|undefined} nivel
 * @returns {string}
 */
export function formatearNivel(nivel) {
  if (!nivel || nivel === 'SIN_EVALUAR') {
    return 'Pendiente de evaluación';
  }
  return NIVEL_ETIQUETAS[nivel] || nivel;
}

/**
 * Formatea la variación de puntos porcentuales.
 * @param {number|null|undefined} valor
 * @returns {string}
 */
export function formatearPuntosPorcentuales(valor) {
  if (valor === null || valor === undefined) {
    return '—';
  }
  const numero = Number(valor);
  const signo = numero > 0 ? '+' : '';
  return `${signo}${numero.toFixed(1)} pp`;
}
