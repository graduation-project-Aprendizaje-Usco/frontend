import { Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { INICIO_POR_ROL } from './navegacion';

/** "/" → inicio del rol si hay sesión; si no, /login. */
export default function RedireccionInicial() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={INICIO_POR_ROL[user.rol] ?? '/no-autorizado'} replace />;
}
