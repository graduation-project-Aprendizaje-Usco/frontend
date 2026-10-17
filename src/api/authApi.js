/**
 * Cliente de /api/auth (contrato de SCRUM-81).
 *
 * Con VITE_USE_MOCKS=true responde con datos simulados (api/mocks/authMock.js);
 * con false o sin definir, llama al backend real. Los componentes usan siempre
 * estas funciones, así que cambiar la variable no obliga a tocar ningún componente.
 *
 * Errores: se lanzan tal cual los de axios. El cuerpo está en error.response.data
 * con el formato estándar del backend: { status, message, path, errores? }.
 */
import api from './client';
import * as simulado from './mocks/authMock';

export const USA_SIMULACION = import.meta.env.VITE_USE_MOCKS === 'true';

/**
 * POST /api/auth/login
 * @param {{ correo: string, password: string }} credenciales
 * @returns {Promise<{ token: string, tipo: 'Bearer', expiraEn: number, usuario: { id: number, nombres: string, correo: string, rol: string } }>}
 *          expiraEn = segundos que faltan para que el token venza.
 */
export async function login({ correo, password }) {
  if (USA_SIMULACION) return simulado.login({ correo, password });
  const { data } = await api.post('/auth/login', { correo, password });
  return data;
}

/**
 * POST /api/auth/registro — solo estudiantes. 201 con el usuario creado; 400 con "errores" por campo
 * si no cumple las reglas (ver features/auth/reglasRegistro.js); 409 si el correo ya existe.
 * @param {{ nombres: string, apellidos: string, correo: string, password: string, programaAcademico: string }} datos
 * @returns {Promise<{ id: number, nombres: string, correo: string, rol: 'ESTUDIANTE' }>}
 */
export async function registro(datos) {
  if (USA_SIMULACION) return simulado.registro(datos);
  const { data } = await api.post('/auth/registro', datos);
  return data;
}

/**
 * GET /api/auth/me — usuario dueño del token guardado. 401 si no hay sesión válida.
 * @returns {Promise<{ id: number, nombres: string, correo: string, rol: string }>}
 */
export async function me() {
  if (USA_SIMULACION) return simulado.me(localStorage.getItem('token'));
  const { data } = await api.get('/auth/me');
  return data;
}
