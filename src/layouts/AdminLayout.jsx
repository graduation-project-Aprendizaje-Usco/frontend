import AppLayout from './AppLayout';
import { ROLES } from '../routes/navegacion';

export default function AdminLayout() {
  return <AppLayout rol={ROLES.ADMIN} />;
}
