import api from './client';

function parametros(filtros = {}) {
  return Object.fromEntries(
    Object.entries(filtros).filter(([, valor]) => valor !== '' && valor != null),
  );
}

/** Resumen de indicadores de un grupo, con filtros opcionales. */
export async function obtenerResumenGrupo(grupoId, filtros = {}) {
  const { data } = await api.get(`/analitica/grupos/${grupoId}`, {
    params: parametros(filtros),
  });
  return data;
}

/** Detalle de un estudiante dentro de un grupo del docente. */
export async function obtenerDetalleEstudiante(grupoId, estudianteId, filtros = {}) {
  const { data } = await api.get(`/analitica/grupos/${grupoId}/estudiantes/${estudianteId}`, {
    params: parametros(filtros),
  });
  return data;
}
