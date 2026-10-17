/**
 * Sesión del usuario (SCRUM-89). Contrato que usan AppLayout, ProtectedRoute y RedireccionInicial:
 *   useAuth() → { user, isAuthenticated, login, logout }
 *   user → { id, nombres, correo, rol } | null
 *
 * - Al cargar la app lee el token guardado con jwt-decode; si está vencido o es inválido, lo descarta.
 * - Cierra la sesión sola cuando el token vence, o cuando el backend responde 401
 *   (api/client.js avisa con el evento EVENTO_SESION_EXPIRADA).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { CLAVE_TOKEN, EVENTO_SESION_EXPIRADA } from '../api/client';

const CLAVE_USUARIO = 'usuario';

const AuthContext = createContext(null);

/** Milisegundos que le quedan al token, o 0 si no hay, está mal formado o ya venció. */
function vigenciaDelToken(token) {
  try {
    const { exp } = jwtDecode(token);
    return Math.max(0, exp * 1000 - Date.now());
  } catch {
    return 0;
  }
}

function borrarSesion() {
  localStorage.removeItem(CLAVE_TOKEN);
  localStorage.removeItem(CLAVE_USUARIO);
}

function leerSesionGuardada() {
  try {
    const token = localStorage.getItem(CLAVE_TOKEN);
    const usuario = JSON.parse(localStorage.getItem(CLAVE_USUARIO));
    if (usuario && vigenciaDelToken(token) > 0) return usuario;
  } catch {
    // JSON dañado en localStorage: se trata como sesión inexistente.
  }
  borrarSesion();
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(leerSesionGuardada);

  /** Recibe la respuesta del login: { token, usuario: { id, nombres, correo, rol } }. */
  const login = useCallback(({ token, usuario }) => {
    localStorage.setItem(CLAVE_TOKEN, token);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    setUser(usuario);
  }, []);

  const logout = useCallback(() => {
    borrarSesion();
    setUser(null);
  }, []);

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

  const valor = useMemo(() => ({ user, isAuthenticated: Boolean(user), login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return contexto;
}
