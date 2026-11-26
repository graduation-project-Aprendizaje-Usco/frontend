/**
 * Cliente de /api/diagnosticos/intentos (contrato de SCRUM-106, README-backend §12).
 * Solo para el rol ESTUDIANTE; el estudiante es siempre el dueño del token.
 *
 * Un intento trae: { id, estado: 'EN_CURSO'|'FINALIZADO', venceEn, segundosRestantes,
 * totalItems, totalRespondidas, respuestas: [{ itemId, opcionId }], resultado, items }.
 * Mientras está EN_CURSO, items trae las 24 preguntas (sin la clave); al finalizar,
 * items va vacío y resultado trae el puntaje.
 *
 * Errores: se lanzan tal cual los de axios (error.response.data = { status, message, … }).
 */
import api from './client';

const BASE = '/diagnosticos/intentos';

/** GET /actual — mi intento en la prueba activa, o null si aún no la he iniciado (204). */
export async function actual() {
  const respuesta = await api.get(`${BASE}/actual`);
  return respuesta.status === 204 ? null : respuesta.data;
}

/** POST — inicia la prueba; si ya existía un intento (en curso o finalizado), lo devuelve. */
export async function iniciar() {
  const { data } = await api.post(BASE);
  return data;
}

/** GET /{id} — consulta un intento (si ya venció, el backend lo finaliza por tiempo). */
export async function obtener(id) {
  const { data } = await api.get(`${BASE}/${id}`);
  return data;
}

/** PUT /{id}/respuestas/{itemId} — guarda o cambia la respuesta de una pregunta. */
export async function responder(id, itemId, opcionId) {
  const { data } = await api.put(`${BASE}/${id}/respuestas/${itemId}`, { opcionId });
  return data;
}

/** POST /{id}/finalizar — entrega y califica; si ya estaba finalizado devuelve lo mismo. */
export async function finalizar(id) {
  const { data } = await api.post(`${BASE}/${id}/finalizar`);
  return data;
}

/** GET /{id}/resultado — puntaje, categoría y niveles por competencia (409 si no ha finalizado). */
export async function resultado(id) {
  const { data } = await api.get(`${BASE}/${id}/resultado`);
  return data;
}
