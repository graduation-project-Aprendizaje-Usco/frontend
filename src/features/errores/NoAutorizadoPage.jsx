import LockOutlined from '@mui/icons-material/LockOutlined';
import PaginaError from './PaginaError';

export default function NoAutorizadoPage() {
  return (
    <PaginaError
      codigo={403}
      titulo="Acceso restringido"
      mensaje="Tu rol no tiene permiso para ver esta sección. Si crees que es un error, contacta al administrador."
      icono={LockOutlined}
    />
  );
}
