import AppLayout from './AppLayout';
import { ROLES } from '../routes/navegacion';

export default function EstudianteLayout() {
  return <AppLayout rol={ROLES.ESTUDIANTE} />;
}
