import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import ProtectedRoute from './ProtectedRoute';
import RedireccionInicial from './RedireccionInicial';
import { ROLES } from './navegacion';

import EstudianteLayout from '../layouts/EstudianteLayout';
import DocenteLayout from '../layouts/DocenteLayout';
import AdminLayout from '../layouts/AdminLayout';

import LoginPage from '../features/auth/LoginPage';
import NoAutorizadoPage from '../features/errores/NoAutorizadoPage';
import NotFoundPage from '../features/errores/NotFoundPage';

import InicioEstudiantePage from '../features/progreso/InicioEstudiantePage';
import DiagnosticoPage from '../features/diagnostico/DiagnosticoPage';
import PracticaPage from '../features/practica/PracticaPage';
import ProgresoPage from '../features/progreso/ProgresoPage';

import InicioDocentePage from '../features/docente/InicioDocentePage';
import EstudiantesPage from '../features/docente/EstudiantesPage';
import ActividadesPage from '../features/docente/ActividadesPage';
import ReportesPage from '../features/docente/ReportesPage';

import InicioAdminPage from '../features/admin/InicioAdminPage';
import UsuariosPage from '../features/admin/UsuariosPage';
import RolesPage from '../features/admin/RolesPage';

// Páginas de prueba de componentes: solo con `npm run dev`. En el build,
// import.meta.env.DEV es false y Vite ni siquiera incluye estos archivos.
const MathTextDemoPage = import.meta.env.DEV ? lazy(() => import('../features/dev/MathTextDemoPage')) : null;

/**
 * Mapa de rutas. Para agregar una pantalla:
 *   1. Crear el componente en features/<modulo>/
 *   2. Agregar <Route> dentro del layout de su rol
 *   3. Si va en el menú, agregarla en routes/navegacion.js
 */
export default function AppRouter() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<RedireccionInicial />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/no-autorizado" element={<NoAutorizadoPage />} />

      {/* Solo desarrollo */}
      {MathTextDemoPage && (
        <Route
          path="/dev/mathtext"
          element={
            <Suspense fallback={null}>
              <MathTextDemoPage />
            </Suspense>
          }
        />
      )}

      {/* Estudiante */}
      <Route element={<ProtectedRoute roles={[ROLES.ESTUDIANTE]} />}>
        <Route path="/estudiante" element={<EstudianteLayout />}>
          <Route index element={<InicioEstudiantePage />} />
          <Route path="diagnostico" element={<DiagnosticoPage />} />
          <Route path="practica" element={<PracticaPage />} />
          <Route path="progreso" element={<ProgresoPage />} />
        </Route>
      </Route>

      {/* Docente */}
      <Route element={<ProtectedRoute roles={[ROLES.DOCENTE]} />}>
        <Route path="/docente" element={<DocenteLayout />}>
          <Route index element={<InicioDocentePage />} />
          <Route path="estudiantes" element={<EstudiantesPage />} />
          <Route path="actividades" element={<ActividadesPage />} />
          <Route path="reportes" element={<ReportesPage />} />
        </Route>
      </Route>

      {/* Administrador */}
      <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<InicioAdminPage />} />
          <Route path="usuarios" element={<UsuariosPage />} />
          <Route path="roles" element={<RolesPage />} />
        </Route>
      </Route>

      {/* Cualquier otra URL */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
