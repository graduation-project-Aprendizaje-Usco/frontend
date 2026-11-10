import { Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import MathText from '../../../components/MathText';
import { etiquetaCompetencia, NIVELES } from './catalogos';

const etiquetaNivel = (valor) => NIVELES.find((nivel) => nivel.valor === valor)?.etiqueta ?? valor;

export default function TablaEjercicios({ ejercicios, onEditar, onCambiarEstado, onEliminar }) {
  if (ejercicios.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography color="text.secondary">
          No hay ejercicios con estos filtros. Crea uno para que aparezca en la práctica.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" aria-label="Ejercicios del docente">
        <TableHead>
          <TableRow>
            <TableCell component="th" scope="col">Ejercicio</TableCell>
            <TableCell component="th" scope="col">Competencia</TableCell>
            <TableCell component="th" scope="col">Nivel</TableCell>
            <TableCell component="th" scope="col">Tipo</TableCell>
            <TableCell component="th" scope="col">Estado</TableCell>
            <TableCell component="th" scope="col" align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ejercicios.map((ejercicio) => (
            <TableRow key={ejercicio.id} hover>
              <TableCell component="th" scope="row" sx={{ maxWidth: 360 }}>
                <Typography variant="caption" color="text.secondary">{ejercicio.codigo}</Typography>
                <MathText texto={ejercicio.enunciado} />
              </TableCell>
              <TableCell>{etiquetaCompetencia(ejercicio.competenciaCodigo)}</TableCell>
              <TableCell>{etiquetaNivel(ejercicio.nivel)}</TableCell>
              <TableCell>{ejercicio.tipo === 'NUMERICA' ? 'Numérica' : 'Opción múltiple'}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={ejercicio.activo ? 'Activo' : 'Inactivo'}
                  color={ejercicio.activo ? 'success' : 'default'}
                  variant="outlined"
                />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                  <Button size="small" onClick={() => onEditar(ejercicio)}>Editar</Button>
                  <Button size="small" onClick={() => onCambiarEstado(ejercicio)}>
                    {ejercicio.activo ? 'Desactivar' : 'Activar'}
                  </Button>
                  <Button size="small" color="error" onClick={() => onEliminar(ejercicio)}>
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
