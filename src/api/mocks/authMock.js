/**
 * Respuestas simuladas de /api/auth con la MISMA forma del contrato (SCRUM-81).
 * Solo se usan con VITE_USE_MOCKS=true (ver authApi.js).
 *
 * Usuarios: los mismos de prueba del backend (db/dev-data), para que cambiar
 * entre simulación y backend real no cambie las credenciales.
 * Los registros nuevos viven en memoria: se pierden al recargar la página.
 */
import { ROLES } from '../../routes/navegacion';

const DURACION_SEGUNDOS = 2 * 60 * 60;
const RETARDO_MS = 400;

const usuarios = [
  { id: 1, nombres: 'Estudiante', correo: 'estudiante@aprendizaje.test', password: 'Estudiante2026*', rol: ROLES.ESTUDIANTE, activo: true },
  { id: 2, nombres: 'Docente', correo: 'docente@aprendizaje.test', password: 'Docente2026*', rol: ROLES.DOCENTE, activo: true },
  { id: 3, nombres: 'Administrador', correo: 'admin@aprendizaje.test', password: 'Admin2026*', rol: ROLES.ADMIN, activo: true },
  { id: 4, nombres: 'Inactivo', correo: 'inactivo@aprendizaje.test', password: 'Inactivo2026*', rol: ROLES.ESTUDIANTE, activo: false },
];

const esperar = () => new Promise((resolver) => setTimeout(resolver, RETARDO_MS));

const normalizarCorreo = (correo) => (correo ?? '').trim().toLowerCase();

const usuarioPublico = ({ id, nombres, correo, rol }) => ({ id, nombres, correo, rol });

/** Error con la misma forma que el de axios: error.response.status y error.response.data. */
function errorSimulado(status, message, path, errores) {
  const error = new Error(message);
  error.response = {
    status,
    data: { timestamp: new Date().toISOString(), status, message, path, ...(errores && { errores }) },
  };
  return error;
}

function base64Url(objeto) {
  const bytes = new TextEncoder().encode(JSON.stringify(objeto));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** JWT con la forma real (header.payload.firma) y los claims del contrato. La firma es falsa. */
function tokenFalso(usuario) {
  const ahora = Math.floor(Date.now() / 1000);
  const payload = { sub: String(usuario.id), correo: usuario.correo, rol: usuario.rol, iat: ahora, exp: ahora + DURACION_SEGUNDOS };
  return `${base64Url({ alg: 'HS256' })}.${base64Url(payload)}.firma-simulada`;
}

function leerPayload(token) {
  try {
    const parte = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(parte), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

export async function login({ correo, password }) {
  await esperar();
  const errores = [];
  if (!correo?.trim()) errores.push({ campo: 'correo', mensaje: 'El correo es obligatorio' });
  if (!password) errores.push({ campo: 'password', mensaje: 'La contraseña es obligatoria' });
  if (errores.length) throw errorSimulado(400, 'La solicitud tiene campos inválidos', '/api/auth/login', errores);

  const usuario = usuarios.find((u) => u.correo === normalizarCorreo(correo));
  if (!usuario || !usuario.activo || usuario.password !== password) {
    throw errorSimulado(401, 'Correo o contraseña incorrectos', '/api/auth/login');
  }
  return { token: tokenFalso(usuario), tipo: 'Bearer', expiraEn: DURACION_SEGUNDOS, usuario: usuarioPublico(usuario) };
}

export async function registro({ nombres, correo, password }) {
  await esperar();
  const correoNormalizado = normalizarCorreo(correo);
  if (usuarios.some((u) => u.correo === correoNormalizado)) {
    throw errorSimulado(409, 'El correo ya está registrado', '/api/auth/registro');
  }
  const nuevo = {
    id: Math.max(...usuarios.map((u) => u.id)) + 1,
    nombres: nombres?.trim(),
    correo: correoNormalizado,
    password,
    rol: ROLES.ESTUDIANTE,
    activo: true,
  };
  usuarios.push(nuevo);
  return usuarioPublico(nuevo);
}

export async function me(token) {
  await esperar();
  const payload = token ? leerPayload(token) : null;
  const usuario = payload && payload.exp * 1000 > Date.now() && usuarios.find((u) => String(u.id) === payload.sub);
  if (!usuario || !usuario.activo) {
    throw errorSimulado(401, 'Debes iniciar sesión para continuar', '/api/auth/me');
  }
  return usuarioPublico(usuario);
}
