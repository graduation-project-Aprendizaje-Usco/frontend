import AppLayout from './AppLayout';
import { ROLES } from '../routes/navegacion';

export default function DocenteLayout() {
  return <AppLayout rol={ROLES.DOCENTE} />;
}
