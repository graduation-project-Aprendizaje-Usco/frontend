/**
 * Panel del administrador (SCRUM-46 / RF-13): usuarios por rol, grupos y actividades
 * activas. Cada rol enlaza a Usuarios con ese filtro; grupos y actividades no tienen
 * pantalla de gestión del administrador, así que solo muestran el conteo.
 */
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { Alert, Box, Button, Link, Paper, Stack, Typography } from '@mui/material';
import AdminPanelSettingsOutlined from '@mui/icons-material/AdminPanelSettingsOutlined';
import AssignmentOutlined from '@mui/icons-material/AssignmentOutlined';
import ClassOutlined from '@mui/icons-material/ClassOutlined';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import PeopleOutlined from '@mui/icons-material/PeopleOutlined';
import SchoolOutlined from '@mui/icons-material/SchoolOutlined';
import { obtenerResumen } from '../../api/adminUsuariosApi';
import { mensajeDeError } from '../../api/errores';
import CargandoPagina from '../../components/CargandoPagina';
import { ROLES } from '../../routes/navegacion';

const ROLES_PANEL = [
  { rol: ROLES.ESTUDIANTE, titulo: 'Estudiantes', enlace: 'Ver estudiantes', icono: SchoolOutlined },
  { rol: ROLES.DOCENTE, titulo: 'Docentes', enlace: 'Ver docentes', icono: PeopleOutlined },
  { rol: ROLES.ADMIN, titulo: 'Administradores', enlace: 'Ver administradores', icono: AdminPanelSettingsOutlined },
];

function Tarjeta({ titulo, valor, detalle, icono: Icono, children }) {
  return (
    <Paper variant="outlined" component="section" aria-label={titulo} sx={{ p: 2.5, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="body2" color="text.secondary" component="h2" sx={{ fontWeight: 600 }}>
          {titulo}
        </Typography>
        <Icono fontSize="small" aria-hidden="true" sx={{ color: 'primary.main' }} />
      </Box>
      <Typography variant="h5" component="p" sx={{ fontWeight: 700 }}>
        {valor}
      </Typography>
      {detalle && (
        <Typography variant="body2" color="text.secondary">
          {detalle}
        </Typography>
      )}
      {children}
    </Paper>
  );
}

export default function InicioAdminPage() {
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Panel de administración · Aprendizaje USCO';
    obtenerResumen()
      .then(setResumen)
      .catch((e) => setError(mensajeDeError(e, 'No pudimos cargar el resumen.')));
  }, []);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!resumen) return <CargandoPagina />;

  const porRol = Object.fromEntries(resumen.usuariosPorRol.map((fila) => [fila.rol, fila]));

  return (
    <Stack spacing={3} sx={{ maxWidth: 1100 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h1">
          Panel de administración
        </Typography>
        <Button component={RouterLink} to="/admin/usuarios" variant="contained" startIcon={<GroupsOutlined />}>
          Gestionar usuarios
        </Button>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        {ROLES_PANEL.map(({ rol, titulo, enlace, icono }) => {
          const fila = porRol[rol] ?? { total: 0, activos: 0 };
          return (
            <Tarjeta key={rol} titulo={titulo} valor={fila.total} detalle={`${fila.activos} activos`} icono={icono}>
              <Link component={RouterLink} to={`/admin/usuarios?rol=${rol}`} sx={{ display: 'inline-block', mt: 1 }}>
                {enlace}
              </Link>
            </Tarjeta>
          );
        })}
        <Tarjeta titulo="Grupos" valor={resumen.grupos} detalle="Grupos creados por los docentes" icono={ClassOutlined} />
        <Tarjeta
          titulo="Contenidos activos"
          valor={resumen.contenidosActivos}
          detalle="Disponibles para la práctica"
          icono={MenuBookOutlined}
        />
        <Tarjeta
          titulo="Ejercicios activos"
          valor={resumen.ejerciciosActivos}
          detalle="Los que el motor puede asignar"
          icono={AssignmentOutlined}
        />
      </Box>
    </Stack>
  );
}
