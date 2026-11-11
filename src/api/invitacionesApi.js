/**
 * Invitaciones de estudiantes por grupo (#150).
 * Los endpoints de gestión exigen DOCENTE dueño del grupo o ADMIN.
 */
import api from './client';

export async function listarInvitaciones(grupoId) {
  const { data } = await api.get(`/grupos/${grupoId}/invitaciones`);
  return data;
}

export async function cargarInvitaciones(grupoId, estudiantes) {
  const { data } = await api.post(`/grupos/${grupoId}/invitaciones`, { estudiantes });
  return data;
}

export async function reenviarInvitacion(grupoId, invitacionId) {
  const { data } = await api.post(`/grupos/${grupoId}/invitaciones/${invitacionId}/reenviar`);
  return data;
}

/** Público: datos que la pantalla de registro precarga desde el enlace. */
export async function obtenerInvitacion(token) {
  const { data } = await api.get('/auth/invitacion', { params: { token } });
  return data;
}
