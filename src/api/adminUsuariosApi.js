/**
 * Cliente de /api/admin/usuarios (SCRUM-45, solo ADMIN).
 * crear() responde { usuario, passwordTemporal }: la contraseña temporal solo llega una vez.
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

export async function cambiarEstado(id, estado) {
  const { data } = await api.patch(`/admin/usuarios/${id}/estado`, { estado });
  return data;
}
