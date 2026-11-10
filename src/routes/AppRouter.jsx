import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import CargandoPagina from '../components/CargandoPagina';
import ProtectedRoute from './ProtectedRoute';
import RedireccionInicial from './RedireccionInicial';
import { ROLES } from './navegacion';

import EstudianteLayout from '../layouts/EstudianteLayout';
import DocenteLayout from '../layouts/DocenteLayout';
import AdminLayout from '../layouts/AdminLayout';

import LoginPage from '../features/auth/LoginPage';
import NoAutorizadoPage from '../features/errores/NoAutorizadoPage';
import NotFoundPage from '../features/errores/NotFoundPage';

// Las páginas de cada rol se cargan bajo demanda (archivos separados en el build):
// quien entra como estudiante no descarga el código del docente ni del administrador.
const RegistroPage = lazy(() => import('../features/auth/RegistroPage'));

const InicioEstudiantePage = lazy(() => import('../features/progreso/InicioEstudiantePage'));
const DiagnosticoPage = lazy(() => import('../features/diagnostico/DiagnosticoPage'));
const PracticaPage = lazy(() => import('../features/practica/PracticaPage'));
const ProgresoPage = lazy(() => import('../features/progreso/ProgresoPage'));

const InicioDocentePage = lazy(() => import('../features/docente/InicioDocentePage'));
const EstudiantesPage = lazy(() => import('../features/docente/EstudiantesPage'));
const ActividadesPage = lazy(() => import('../features/docente/ActividadesPage'));
const ReportesPage = lazy(() => import('../features/docente/ReportesPage'));

const InicioAdminPage = lazy(() => import('../features/admin/InicioAdminPage'));
const UsuariosPage = lazy(() => import('../features/admin/UsuariosPage'));
const RolesPage = lazy(() => import('../features/admin/RolesPage'));
const GruposAdminPage = lazy(() => import('../features/admin/GruposAdminPage'));
const ActividadesAdminPage = lazy(() => import('../features/admin/ActividadesAdminPage'));

// Páginas de prueba de componentes: solo con `npm run dev`. En el build,
// import.meta.env.DEV es false y Vite ni siquiera incluye estos archivos.
const MathTextDemoPage = import.meta.env.DEV ? lazy(() => import('../features/dev/MathTextDemoPage')) : null;

/**
 * Mapa de rutas. Para agregar una pantalla:
 *   1. Crear el componente en features/<modulo>/
 *   2. Importarlo con lazy() arriba y agregar <Route> dentro del layout de su rol
 *   3. Si va en el menú, agregarla en routes/navegacion.js
 */
export default function AppRouter() {
  return (
    <Suspense fallback={<CargandoPagina />}>
      <Routes>
        {/* Públicas */}
        <Route path="/" element={<RedireccionInicial />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />
        <Route path="/no-autorizado" element={<NoAutorizadoPage />} />

        {/* Solo desarrollo */}
        {MathTextDemoPage && <Route path="/dev/mathtext" element={<MathTextDemoPage />} />}

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
            <Route path="grupos" element={<GruposAdminPage />} />
            <Route path="actividades" element={<ActividadesAdminPage />} />
            <Route path="roles" element={<RolesPage />} />
          </Route>
        </Route>

        {/* Cualquier otra URL */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
