/**
 * Sesión del usuario (SCRUM-89). Contrato que usan AppLayout, ProtectedRoute y RedireccionInicial:
 *   useAuth() → { user, isAuthenticated, login, logout }
 *   user → { id, nombres, correo, rol } | null
 *
 * De dónde sale cada dato (hallazgo 3 de la revisión):
 *  - id, correo y ROL salen del TOKEN (claims sub, correo, rol), no de lo guardado en el
 *    navegador: editar el objeto "usuario" de localStorage ya no cambia el rol. Un token
 *    alterado no pasa la firma del backend → 401 → se cierra la sesión.
 *  - nombres sale de "usuario" en localStorage (solo para mostrarlo en la barra).
 *  - Al abrir la app con una sesión guardada se confirma con GET /api/auth/me: si el
 *    backend responde 401 (usuario desactivado, token inválido) o el rol cambió, se cierra.
 *
 * Cuándo se cierra sola:
 *  - al vencer el token (temporizador), o con un 401 del backend (evento de api/client.js);
 *  - si la sesión se cerró en otra pestaña (evento "storage");
 *  - si el navegador restaura una página vieja con el botón Atrás (evento "pageshow" desde
 *    su caché): se vuelve a leer localStorage, que ya no tiene el token.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { me } from '../api/authApi';
import { CLAVE_TOKEN, EVENTO_SESION_EXPIRADA } from '../api/client';
import { ROLES } from '../routes/navegacion';

const CLAVE_USUARIO = 'usuario';
const ROLES_VALIDOS = Object.values(ROLES);

const AuthContext = createContext(null);

function leerClaims(token) {
  try {
    return token ? jwtDecode(token) : null;
  } catch {
    return null;
  }
}

/** Milisegundos que le quedan al token, o 0 si no hay, está mal formado o ya venció. */
function vigenciaDelToken(token) {
  const claims = leerClaims(token);
  return claims?.exp ? Math.max(0, claims.exp * 1000 - Date.now()) : 0;
}

function leerUsuarioGuardado() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_USUARIO));
  } catch {
    return null; // JSON dañado: solo se pierde el nombre a mostrar.
  }
}

/** Arma el usuario de la sesión a partir del token; null si el token no sirve. */
function usuarioDesdeToken(token, guardado) {
  const claims = leerClaims(token);
  if (!claims || vigenciaDelToken(token) === 0 || !ROLES_VALIDOS.includes(claims.rol)) return null;
  return {
    id: Number(claims.sub),
    correo: claims.correo,
    rol: claims.rol,
    nombres: guardado?.nombres ?? claims.correo,
  };
}

function borrarSesion() {
  localStorage.removeItem(CLAVE_TOKEN);
  localStorage.removeItem(CLAVE_USUARIO);
}

function leerSesionGuardada() {
  const usuario = usuarioDesdeToken(localStorage.getItem(CLAVE_TOKEN), leerUsuarioGuardado());
  if (!usuario) borrarSesion();
  return usuario;
}

/** Evita renders de más: solo cambia el estado si cambió algo visible. */
const mismoUsuario = (a, b) =>
  a === b || (a && b && a.id === b.id && a.rol === b.rol && a.correo === b.correo && a.nombres === b.nombres);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(leerSesionGuardada);
  // Sesión con la que abrió la app: es la que se confirma con /me (no la de un login nuevo).
  const sesionInicial = useRef(user);

  const sincronizar = useCallback(() => {
    const actual = leerSesionGuardada();
    setUser((anterior) => (mismoUsuario(anterior, actual) ? anterior : actual));
  }, []);

  /** Recibe la respuesta del login: { token, usuario: { id, nombres, correo, rol } }. */
  const login = useCallback(({ token, usuario }) => {
    const sesion = usuarioDesdeToken(token, usuario);
    if (!sesion) {
      borrarSesion();
      setUser(null);
      return;
    }
    localStorage.setItem(CLAVE_TOKEN, token);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify({ nombres: usuario?.nombres }));
    setUser(sesion);
  }, []);

  const logout = useCallback(() => {
    borrarSesion();
    setUser(null);
  }, []);

  // Al abrir la app con una sesión guardada, el backend confirma que sigue siendo válida.
  useEffect(() => {
    const inicial = sesionInicial.current;
    if (!inicial) return undefined;
    let cancelado = false;
    me()
      .then((datos) => {
        if (cancelado) return;
        if (datos.rol !== inicial.rol || Number(datos.id) !== inicial.id) {
          logout(); // el rol o el usuario cambiaron en el servidor: hay que volver a entrar
          return;
        }
        localStorage.setItem(CLAVE_USUARIO, JSON.stringify({ nombres: datos.nombres }));
        setUser((anterior) => (anterior ? { ...anterior, nombres: datos.nombres, correo: datos.correo } : anterior));
      })
      .catch((error) => {
        // 401: el interceptor de api/client.js ya avisa; se cierra aquí también por si acaso.
        // Sin conexión con el backend se conserva la sesión: no es culpa del usuario.
        if (!cancelado && error?.response?.status === 401) logout();
      });
    return () => {
      cancelado = true;
    };
  }, [logout]);

  // Cierra la sesión justo cuando vence el token, aunque el usuario no haga ninguna petición.
  useEffect(() => {
    if (!user) return undefined;
    const temporizador = setTimeout(logout, vigenciaDelToken(localStorage.getItem(CLAVE_TOKEN)));
    return () => clearTimeout(temporizador);
  }, [user, logout]);

  // Un 401 del backend (token vencido, usuario desactivado…) también cierra la sesión.
  useEffect(() => {
    window.addEventListener(EVENTO_SESION_EXPIRADA, logout);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, logout);
  }, [logout]);

  // Mantiene la sesión al día con localStorage:
  //  - "storage": otra pestaña inició o cerró sesión;
  //  - "pageshow" con persisted: el navegador restauró esta página desde su caché (botón Atrás)
  //    con el estado de React de antes de cerrar sesión.
  useEffect(() => {
    const alCambiarStorage = (evento) => {
      if (evento.key === null || evento.key === CLAVE_TOKEN || evento.key === CLAVE_USUARIO) sincronizar();
    };
    const alMostrarPagina = (evento) => {
      if (evento.persisted) sincronizar();
    };
    window.addEventListener('storage', alCambiarStorage);
    window.addEventListener('pageshow', alMostrarPagina);
    return () => {
      window.removeEventListener('storage', alCambiarStorage);
      window.removeEventListener('pageshow', alMostrarPagina);
    };
  }, [sincronizar]);

  const valor = useMemo(() => ({ user, isAuthenticated: Boolean(user), login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return contexto;
}
