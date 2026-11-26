import api from './client';

/** GET /api/grupos — solo los grupos del docente autenticado (o todos si es ADMIN). */
export async function listar() {
  const { data } = await api.get('/grupos');
  return data;
}

/** POST /api/grupos — crea un grupo del docente autenticado. */
export async function crear(grupo) {
  const { data } = await api.post('/grupos', grupo);
  return data;
}

/** POST /api/grupos/{id}/estudiantes — inscribe un estudiante por correo. */
export async function inscribir(grupoId, correo) {
  const { data } = await api.post(`/grupos/${grupoId}/estudiantes`, { correo });
  return data;
}

/** GET /api/grupos/{id}/estudiantes — solo DOCENTE del grupo o ADMIN. */
export async function estudiantes(grupoId) {
  const { data } = await api.get(`/grupos/${grupoId}/estudiantes`);
  return data;
}
