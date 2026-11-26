import HomeOutlined from '@mui/icons-material/HomeOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import TrackChangesOutlined from '@mui/icons-material/TrackChangesOutlined';
import InsertChartOutlined from '@mui/icons-material/InsertChartOutlined';
import PeopleOutlined from '@mui/icons-material/PeopleOutlined';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import AssessmentOutlined from '@mui/icons-material/AssessmentOutlined';
import ManageAccountsOutlined from '@mui/icons-material/ManageAccountsOutlined';
import AdminPanelSettingsOutlined from '@mui/icons-material/AdminPanelSettingsOutlined';
import ClassOutlined from '@mui/icons-material/ClassOutlined';

/**
 * Fuente única de verdad de roles, rutas de inicio y menús.
 * Si se agrega una pantalla al menú, se agrega aquí y en AppRouter.jsx.
 * Los valores de ROLES deben coincidir con el claim "rol" del JWT del backend.
 */
export const ROLES = Object.freeze({
  ESTUDIANTE: 'ESTUDIANTE',
  DOCENTE: 'DOCENTE',
  ADMIN: 'ADMIN',
});

export const ETIQUETA_ROL = {
  [ROLES.ESTUDIANTE]: 'Estudiante',
  [ROLES.DOCENTE]: 'Docente',
  [ROLES.ADMIN]: 'Administrador',
};

export const INICIO_POR_ROL = {
  [ROLES.ESTUDIANTE]: '/estudiante',
  [ROLES.DOCENTE]: '/docente',
  [ROLES.ADMIN]: '/admin',
};

/** exacta: true → el ítem solo queda activo en esa ruta exacta (no en sus hijas). */
export const MENU_POR_ROL = {
  [ROLES.ESTUDIANTE]: [
    { etiqueta: 'Inicio', ruta: '/estudiante', icono: HomeOutlined, exacta: true },
    { etiqueta: 'Diagnóstico', ruta: '/estudiante/diagnostico', icono: AssignmentOutlined },
    { etiqueta: 'Práctica', ruta: '/estudiante/practica', icono: TrackChangesOutlined },
    { etiqueta: 'Mi progreso', ruta: '/estudiante/progreso', icono: InsertChartOutlined },
  ],
  [ROLES.DOCENTE]: [
    { etiqueta: 'Inicio', ruta: '/docente', icono: HomeOutlined, exacta: true },
    { etiqueta: 'Estudiantes', ruta: '/docente/estudiantes', icono: PeopleOutlined },
    { etiqueta: 'Actividades', ruta: '/docente/actividades', icono: MenuBookOutlined },
    { etiqueta: 'Reportes', ruta: '/docente/reportes', icono: AssessmentOutlined },
  ],
  [ROLES.ADMIN]: [
    { etiqueta: 'Inicio', ruta: '/admin', icono: HomeOutlined, exacta: true },
    { etiqueta: 'Usuarios', ruta: '/admin/usuarios', icono: ManageAccountsOutlined },
    { etiqueta: 'Grupos', ruta: '/admin/grupos', icono: ClassOutlined },
    { etiqueta: 'Actividades', ruta: '/admin/actividades', icono: MenuBookOutlined },
    { etiqueta: 'Reportes', ruta: '/admin/reportes', icono: AssessmentOutlined },
    { etiqueta: 'Roles y permisos', ruta: '/admin/roles', icono: AdminPanelSettingsOutlined },
  ],
};
