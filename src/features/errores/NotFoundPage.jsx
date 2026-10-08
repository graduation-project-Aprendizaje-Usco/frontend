import SearchOffOutlined from '@mui/icons-material/SearchOffOutlined';
import PaginaError from './PaginaError';

export default function NotFoundPage() {
  return (
    <PaginaError
      codigo={404}
      titulo="Página no encontrada"
      mensaje="La dirección que buscas no existe o fue movida. Revisa la URL o vuelve a tu inicio."
      icono={SearchOffOutlined}
    />
  );
}
