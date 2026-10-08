/**
 * PROVISIONAL: sesión mínima para poder probar enrutador y layouts mientras se
 * integra la tarea de login (Fernando). Cumple el contrato que usan AppLayout,
 * ProtectedRoute y RedireccionInicial:
 *   useAuth() → { user, isAuthenticated, login, logout }
 *   user → { id, nombres, correo, rol } | null
 * Fernando la reemplaza por la versión con jwt-decode y validación de expiración,
 * manteniendo esos mismos nombres.
 */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const CLAVE_TOKEN = 'token';
const CLAVE_USUARIO = 'usuario';

const AuthContext = createContext(null);

function leerUsuarioGuardado() {
  try {
    const guardado = localStorage.getItem(CLAVE_USUARIO);
    return guardado ? JSON.parse(guardado) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(leerUsuarioGuardado);

  /** Recibe la respuesta del login: { token, usuario: { id, nombres, correo, rol } }. */
  const login = useCallback(({ token, usuario }) => {
    if (token) localStorage.setItem(CLAVE_TOKEN, token);
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(usuario));
    setUser(usuario);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
    setUser(null);
  }, []);

  const valor = useMemo(() => ({ user, isAuthenticated: Boolean(user), login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return contexto;
}
