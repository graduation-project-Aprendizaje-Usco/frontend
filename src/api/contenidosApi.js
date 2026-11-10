import api from './client';

export async function listar(filtros = {}) {
  const { data } = await api.get('/contenidos', { params: filtros });
  return data;
}

export async function crear(contenido) {
  const { data } = await api.post('/contenidos', contenido);
  return data;
}

export async function actualizar(id, contenido) {
  const { data } = await api.put(`/contenidos/${id}`, contenido);
  return data;
}

export async function cambiarEstado(id, activo) {
  const { data } = await api.patch(`/contenidos/${id}/estado`, { activo });
  return data;
}

export async function eliminar(id) {
  await api.delete(`/contenidos/${id}`);
}
