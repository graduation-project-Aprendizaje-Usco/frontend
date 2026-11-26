import api from './client';

export async function obtenerMiProgreso() {
  const { data } = await api.get('/progreso/me');
  return data;
}

