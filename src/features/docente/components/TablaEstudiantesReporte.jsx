import { Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { formatearNivel, formatearPorcentaje } from '../../progreso/utils/formatearProgreso';

const CATEGORIAS = {
  ALTO_RIESGO: { etiqueta: 'Alto riesgo', color: 'error' },
  RIESGO_MODERADO: { etiqueta: 'Riesgo moderado', color: 'warning' },
  NIVEL_ADECUADO: { etiqueta: 'Nivel adecuado', color: 'success' },
  SIN_DIAGNOSTICO: { etiqueta: 'Sin diagnóstico', color: 'default' },
};

export default function TablaEstudiantesReporte({ estudiantes = [] }) {
  return (
    <Paper
      variant="outlined"
      component="section"
      aria-labelledby="titulo-estudiantes-reporte"
      sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}
    >
      <Typography id="titulo-estudiantes-reporte" variant="h6" component="h2" sx={{ mb: 2 }}>
        Desempeño de estudiantes
      </Typography>
      {estudiantes.length === 0 ? (
        <Typography color="text.secondary">No hay estudiantes inscritos en este grupo.</Typography>
      ) : (
        <TableContainer>
          <Table size="small" aria-label="Reporte de estudiantes del grupo">
            <TableHead>
              <TableRow>
                <TableCell component="th" scope="col">Estudiante</TableCell>
                <TableCell component="th" scope="col" align="right">Promedio práctica</TableCell>
                <TableCell component="th" scope="col" align="right">Resultado diagnóstico</TableCell>
                <TableCell component="th" scope="col">Nivel</TableCell>
                <TableCell component="th" scope="col">Categoría</TableCell>
                <TableCell component="th" scope="col" align="right">Intentos</TableCell>
                <TableCell component="th" scope="col">Riesgo</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {estudiantes.map((estudiante) => {
                const categoria = CATEGORIAS[estudiante.categoriaDiagnostico] ?? CATEGORIAS.SIN_DIAGNOSTICO;
                return (
                  <TableRow key={estudiante.id}>
                    <TableCell component="th" scope="row">
                      {estudiante.apellidos}, {estudiante.nombres}
                    </TableCell>
                    <TableCell align="right">
                      {estudiante.promedio == null ? '—' : formatearPorcentaje(estudiante.promedio)}
                    </TableCell>
                    <TableCell align="right">
                      {estudiante.porcentajeDiagnostico == null
                        ? '—'
                        : formatearPorcentaje(estudiante.porcentajeDiagnostico)}
                    </TableCell>
                    <TableCell>{formatearNivel(estudiante.nivel)}</TableCell>
                    <TableCell>
                      <Chip size="small" color={categoria.color} label={categoria.etiqueta} variant="outlined" />
                    </TableCell>
                    <TableCell align="right">{estudiante.intentos}</TableCell>
                    <TableCell>
                      {estudiante.enRiesgo ? (
                        <Chip size="small" color="error" label="En riesgo" variant="outlined" />
                      ) : (
                        'No'
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
