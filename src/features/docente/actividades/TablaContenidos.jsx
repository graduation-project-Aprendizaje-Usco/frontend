import { Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { ASIGNATURAS, etiquetaCompetencia } from './catalogos';

export default function TablaContenidos({ contenidos, onEditar, onCambiarEstado, onEliminar }) {
  if (contenidos.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography color="text.secondary">
          No hay contenidos con estos filtros. Crea uno para agrupar tus ejercicios.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" aria-label="Contenidos del docente">
        <TableHead>
          <TableRow>
            <TableCell component="th" scope="col">Título</TableCell>
            <TableCell component="th" scope="col">Competencia</TableCell>
            <TableCell component="th" scope="col">Asignatura</TableCell>
            <TableCell component="th" scope="col" align="right">Ejercicios</TableCell>
            <TableCell component="th" scope="col">Estado</TableCell>
            <TableCell component="th" scope="col" align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contenidos.map((contenido) => (
            <TableRow key={contenido.id} hover>
              <TableCell component="th" scope="row">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{contenido.titulo}</Typography>
                <Typography variant="caption" color="text.secondary">{contenido.tema}</Typography>
              </TableCell>
              <TableCell>{etiquetaCompetencia(contenido.competenciaCodigo)}</TableCell>
              <TableCell>
                {ASIGNATURAS.find((asignatura) => asignatura.valor === contenido.asignatura)?.etiqueta
                  ?? contenido.asignatura}
              </TableCell>
              <TableCell align="right">{contenido.totalEjercicios}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={contenido.activo ? 'Activo' : 'Inactivo'}
                  color={contenido.activo ? 'success' : 'default'}
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                  <Button size="small" onClick={() => onEditar(contenido)}>Editar</Button>
                  <Button size="small" onClick={() => onCambiarEstado(contenido)}>
                    {contenido.activo ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button size="small" color="error" onClick={() => onEliminar(contenido)}>
                    Eliminar
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
