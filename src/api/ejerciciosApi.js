import api from './client';

export async function listar(filtros = {}) {
  const { data } = await api.get('/ejercicios', { params: filtros });
  return data;
}

export async function crear(ejercicio) {
  const { data } = await api.post('/ejercicios', ejercicio);
  return data;
}

export async function actualizar(id, ejercicio) {
  const { data } = await api.put(`/ejercicios/${id}`, ejercicio);
  return data;
}

export async function cambiarEstado(id, activo) {
  const { data } = await api.patch(`/ejercicios/${id}/estado`, { activo });
  return data;
}

export async function eliminar(id) {
  await api.delete(`/ejercicios/${id}`);
}
