import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

/**
 * Sin sesión → /login, recordando la ruta que se intentaba abrir (LoginPage vuelve a ella).
 * Rol distinto → /no-autorizado.
 */
export default function ProtectedRoute({ roles }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ desde: location }} />;
  if (roles && !roles.includes(user.rol)) return <Navigate to="/no-autorizado" replace />;
  return <Outlet />;
}
