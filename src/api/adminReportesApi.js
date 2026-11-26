import api from './client';

export async function obtenerReporteAdmin(filtros = {}) {
  const params = Object.fromEntries(
    Object.entries(filtros).filter(([, valor]) => valor !== '' && valor != null),
  );
  const { data } = await api.get('/admin/reportes', { params });
  return data;
}
