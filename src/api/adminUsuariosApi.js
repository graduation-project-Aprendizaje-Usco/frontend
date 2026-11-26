/**
 * Cliente de /api/admin/usuarios (SCRUM-45, solo ADMIN).
 */
import api from './client';

export async function listar(filtros = {}) {
  // Los filtros vacíos no se envían: el backend los toma como "sin filtro".
  const params = Object.fromEntries(Object.entries(filtros).filter(([, valor]) => valor !== ''));
  const { data } = await api.get('/admin/usuarios', { params });
  return data;
}

export async function crear(usuario) {
  const { data } = await api.post('/admin/usuarios', usuario);
  return data;
}

export async function actualizar(id, usuario) {
  const { data } = await api.put(`/admin/usuarios/${id}`, usuario);
  return data;
}

/** GET /api/admin/resumen: { usuariosPorRol: [{ rol, total, activos }], grupos, contenidosActivos, ejerciciosActivos }. */
export async function obtenerResumen() {
  const { data } = await api.get('/admin/resumen');
  return data;
}

export async function cambiarEstado(id, estado) {
  const { data } = await api.patch(`/admin/usuarios/${id}/estado`, { estado });
  return data;
}

export async function reenviarActivacion(id) {
  await api.post(`/admin/usuarios/${id}/reenviar-activacion`);
}
