import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import MathText from '../../../components/MathText';
import { formatearPorcentaje } from '../../progreso/utils/formatearProgreso';

export default function TablaEjerciciosErrores({ ejercicios = [] }) {
  return (
    <Paper variant="outlined" component="section" aria-labelledby="titulo-errores" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
      <Typography id="titulo-errores" variant="h6" component="h2">
        Ejercicios con más errores
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Top 5 del grupo en el periodo consultado.
      </Typography>
      {ejercicios.length === 0 ? (
        <Typography color="text.secondary">Aún no hay intentos de práctica en el grupo.</Typography>
      ) : (
        <TableContainer>
          <Table size="small" aria-label="Ejercicios con más errores del grupo">
            <TableHead>
              <TableRow>
                <TableCell component="th" scope="col">Ejercicio</TableCell>
                <TableCell component="th" scope="col">Competencia</TableCell>
                <TableCell component="th" scope="col" align="right">Nivel</TableCell>
                <TableCell component="th" scope="col" align="right">Intentos</TableCell>
                <TableCell component="th" scope="col" align="right">Errores</TableCell>
                <TableCell component="th" scope="col" align="right">Tasa de error</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ejercicios.map((ejercicio) => (
                <TableRow key={ejercicio.ejercicioId}>
                  <TableCell component="th" scope="row" sx={{ maxWidth: 320 }}>
                    <Typography variant="caption" color="text.secondary">{ejercicio.codigo}</Typography>
                    <MathText texto={ejercicio.enunciado} />
                  </TableCell>
                  <TableCell>{ejercicio.competenciaNombre}</TableCell>
                  <TableCell align="right">{ejercicio.nivel}</TableCell>
                  <TableCell align="right">{ejercicio.intentos}</TableCell>
                  <TableCell align="right">{ejercicio.errores}</TableCell>
                  <TableCell align="right">{formatearPorcentaje(ejercicio.tasaError)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
