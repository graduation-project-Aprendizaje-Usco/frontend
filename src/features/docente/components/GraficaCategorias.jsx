import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatearPorcentaje } from '../../progreso/utils/formatearProgreso';

const ETIQUETAS = {
  ALTO_RIESGO: 'Alto riesgo',
  RIESGO_MODERADO: 'Riesgo moderado',
  NIVEL_ADECUADO: 'Nivel adecuado',
  SIN_DIAGNOSTICO: 'Sin diagnóstico',
};

function colorCategoria(theme, categoria) {
  if (categoria === 'ALTO_RIESGO') return theme.palette.error.main;
  if (categoria === 'RIESGO_MODERADO') return theme.palette.warning.main;
  if (categoria === 'NIVEL_ADECUADO') return theme.palette.success.main;
  return theme.palette.secondary.main;
}

export default function GraficaCategorias({ distribucion = [] }) {
  const theme = useTheme();
  const datos = distribucion
    .filter((fila) => fila.cantidad > 0)
    .map((fila) => ({ ...fila, nombre: ETIQUETAS[fila.categoria] ?? fila.categoria }));

  return (
    <Paper variant="outlined" component="figure" sx={{ m: 0, p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
      <Typography component="figcaption" variant="h6" sx={{ fontWeight: 700 }}>
        Distribución de categorías
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Última categoría de diagnóstico registrada por estudiante.
      </Typography>

      {datos.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          Aún no hay diagnósticos registrados en el grupo.
        </Typography>
      ) : (
        <Box aria-hidden="true" sx={{ width: '100%', height: 250, mt: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart accessibilityLayer={false}>
              <Pie
                data={datos}
                dataKey="cantidad"
                nameKey="nombre"
                cx="50%"
                cy="45%"
                outerRadius={70}
                isAnimationActive={false}
                // El Pie de recharts es enfocable por defecto aunque la gráfica esté oculta (aria-hidden).
                rootTabIndex={-1}
              >
                {datos.map((fila) => (
                  <Cell key={fila.categoria} fill={colorCategoria(theme, fila.categoria)} />
                ))}
              </Pie>
              <Tooltip formatter={(valor) => [`${valor} estudiantes`, 'Cantidad']} />
              <Legend height={48} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      )}

      <TableContainer>
        <Table size="small" aria-label="Distribución de categorías del grupo">
          <TableHead>
            <TableRow>
              <TableCell component="th" scope="col">
                Categoría
              </TableCell>
              <TableCell component="th" scope="col" align="right">
                Estudiantes
              </TableCell>
              <TableCell component="th" scope="col" align="right">
                Porcentaje
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {distribucion.map((fila) => (
              <TableRow key={fila.categoria}>
                <TableCell component="th" scope="row">
                  {ETIQUETAS[fila.categoria] ?? fila.categoria}
                </TableCell>
                <TableCell align="right">{fila.cantidad}</TableCell>
                <TableCell align="right">{formatearPorcentaje(fila.porcentaje)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
