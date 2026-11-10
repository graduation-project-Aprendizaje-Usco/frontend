/**
 * Cliente de /api/admin/actividades (SCRUM-46, solo ADMIN).
 * Devuelve el catálogo de contenidos y ejercicios de todos los docentes.
 */
import api from './client';

export async function obtener() {
  const { data } = await api.get('/admin/actividades');
  return data;
}
