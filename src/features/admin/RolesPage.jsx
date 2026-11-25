/**
 * Roles y permisos (RF-13). Los roles son fijos; esta pantalla explica qué puede
 * hacer cada uno y lleva a Usuarios con el filtro correspondiente. El cambio de
 * rol se hace desde la ficha de cada usuario.
 */
import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router';
import {
  Box,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { ETIQUETA_ROL, ROLES } from '../../routes/navegacion';

const DESCRIPCIONES = {
  [ROLES.ESTUDIANTE]: 'Presenta el diagnóstico, practica ejercicios y consulta su progreso e historial.',
  [ROLES.DOCENTE]: 'Gestiona sus grupos, inscribe estudiantes, crea actividades y consulta la analítica de sus grupos.',
  [ROLES.ADMIN]: 'Administra usuarios y roles, consulta grupos y el catálogo de actividades de la plataforma.',
};

export default function RolesPage() {
  useEffect(() => {
    document.title = 'Roles y permisos · Aprendizaje USCO';
  }, []);

  return (
    <Stack spacing={3} sx={{ maxWidth: 1000 }}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Roles y permisos
        </Typography>
        <Typography color="text.secondary">
          Los roles son fijos. El rol de una persona se cambia desde su ficha en Usuarios.
        </Typography>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small" aria-label="Roles y permisos de la plataforma">
          <TableHead>
            <TableRow>
              <TableCell component="th" scope="col">Rol</TableCell>
              <TableCell component="th" scope="col">Qué puede hacer</TableCell>
              <TableCell component="th" scope="col" align="right">Usuarios</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.values(ROLES).map((rol) => (
              <TableRow key={rol}>
                <TableCell component="th" scope="row">{ETIQUETA_ROL[rol]}</TableCell>
                <TableCell>{DESCRIPCIONES[rol]}</TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <Link component={RouterLink} to={`/admin/usuarios?rol=${rol}`}>
                    Ver usuarios
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" color="text.secondary">
        Para cambiar el rol, abre <Link component={RouterLink} to="/admin/usuarios">Usuarios</Link>, edita la
        cuenta y elige el rol en el formulario. Un administrador no puede quitarse su propio rol.
      </Typography>
    </Stack>
  );
}
