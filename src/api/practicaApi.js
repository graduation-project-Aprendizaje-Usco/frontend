/**
 * Cliente de los endpoints disponibles de /api/practica.
 * Los errores de Axios se propagan para que la pantalla pueda distinguir, por
 * ejemplo, que no hay más ejercicios (404) de un fallo de conexión.
 */
import api from './client';

const BASE = '/practica';

/** GET /siguiente?asignatura=... — devuelve un ejercicio o 404 si no hay disponibles. */
export async function siguiente(asignatura) {
  const { data } = await api.get(`${BASE}/siguiente`, { params: { asignatura } });
  return data;
}

/** POST /intentos — registra una respuesta y devuelve el resultado confirmado por el backend. */
export async function responder(intento) {
  const { data } = await api.post(`${BASE}/intentos`, intento);
  return data;
}
