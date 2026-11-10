import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatearPorcentaje } from '../../progreso/utils/formatearProgreso';

const etiquetaSemana = (semana) => `Semana ${semana.semana} (${semana.fechaInicio})`;

export default function GraficaEvolucionGeneral({ evolucion = [] }) {
  return (
    <Paper variant="outlined" component="figure" sx={{ m: 0, p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
      <Typography component="figcaption" variant="h6" sx={{ fontWeight: 700 }}>
        Evolución general
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Promedio semanal de aciertos del grupo.
      </Typography>
      {evolucion.length === 0 ? (
        <Typography color="text.secondary">Aún no hay datos para mostrar la evolución.</Typography>
      ) : (
        <>
          <Box aria-hidden="true" sx={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucion} margin={{ top: 10, right: 20, bottom: 10, left: 0 }} accessibilityLayer={false}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fechaInicio" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(valor) => [formatearPorcentaje(valor), 'Promedio']}
                  labelFormatter={(valor, payload) => (payload?.[0] ? etiquetaSemana(payload[0].payload) : valor)}
                />
                <Line type="monotone" dataKey="promedio" stroke="#8F141B" strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
          <TableContainer>
            <Table size="small" aria-label="Evolución semanal del grupo">
              <TableHead>
                <TableRow>
                  <TableCell component="th" scope="col">Semana</TableCell>
                  <TableCell component="th" scope="col" align="right">Intentos</TableCell>
                  <TableCell component="th" scope="col" align="right">Aciertos</TableCell>
                  <TableCell component="th" scope="col" align="right">Promedio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {evolucion.map((semana) => (
                  <TableRow key={semana.fechaInicio}>
                    <TableCell component="th" scope="row">{etiquetaSemana(semana)}</TableCell>
                    <TableCell align="right">{semana.intentosEvaluados}</TableCell>
                    <TableCell align="right">{semana.intentosCorrectos}</TableCell>
                    <TableCell align="right">{formatearPorcentaje(semana.promedio)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Paper>
  );
}
