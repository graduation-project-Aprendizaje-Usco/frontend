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
import { Bar, BarChart, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatearPorcentaje } from '../../progreso/utils/formatearProgreso';

function colorDimension(theme, codigo) {
  const cod = (codigo || '').toLowerCase();
  if (cod.includes('alg')) return theme.palette.dimension?.algebraica ?? theme.palette.primary.main;
  if (cod.includes('log')) return theme.palette.dimension?.logica ?? theme.palette.secondary.main;
  if (cod.includes('fun')) return theme.palette.dimension?.funcional ?? theme.palette.info.main;
  return theme.palette.primary.main;
}

export default function GraficaDimensionesGrupo({ dimensiones = [] }) {
  const theme = useTheme();
  const datos = dimensiones.map((dimension) => ({
    ...dimension,
    valor: dimension.promedio == null ? null : Number(dimension.promedio),
  }));

  return (
    <Paper variant="outlined" component="figure" sx={{ m: 0, p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
      <Typography component="figcaption" variant="h6" sx={{ fontWeight: 700 }}>
        Promedio por dimensión
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Promedio de los porcentajes individuales de los estudiantes con actividad.
      </Typography>

      <Box
        aria-hidden="true"
        sx={{ height: Math.max(180, 70 * dimensiones.length + 30), width: '100%', my: 1 }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={datos}
            layout="vertical"
            margin={{ top: 10, right: 70, bottom: 10, left: 20 }}
            accessibilityLayer={false}
          >
            <XAxis type="number" domain={[0, 100]} tick={{ fill: theme.palette.text.secondary }} />
            <YAxis
              type="category"
              dataKey="nombre"
              width={160}
              tickLine={false}
              axisLine={false}
              tick={{ fill: theme.palette.text.primary, fontSize: 13 }}
            />
            <Tooltip
              formatter={(valor, _nombre, { payload }) =>
                payload.promedio == null
                  ? ['Sin actividad', 'Promedio']
                  : [`${formatearPorcentaje(valor)} (${payload.estudiantesEvaluados} estudiantes)`, 'Promedio']
              }
            />
            <Bar dataKey="valor" barSize={22} radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {datos.map((dimension) => (
                <Cell key={dimension.codigo} fill={colorDimension(theme, dimension.codigo)} />
              ))}
              <LabelList
                dataKey="valor"
                position="right"
                formatter={(valor) => (valor == null ? 'Sin act.' : `${Math.round(valor)} %`)}
                fill={theme.palette.text.primary}
                style={{ fontSize: '12px', fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <TableContainer>
        <Table size="small" aria-label="Promedio por dimensión del grupo">
          <TableHead>
            <TableRow>
              <TableCell component="th" scope="col">
                Dimensión
              </TableCell>
              <TableCell component="th" scope="col" align="right">
                Promedio
              </TableCell>
              <TableCell component="th" scope="col" align="right">
                Estudiantes
              </TableCell>
              <TableCell component="th" scope="col" align="right">
                Intentos
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dimensiones.map((dimension) => (
              <TableRow key={dimension.codigo}>
                <TableCell component="th" scope="row">
                  {dimension.nombre}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    {dimension.codigo}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {dimension.promedio == null ? 'Sin actividad' : formatearPorcentaje(dimension.promedio)}
                </TableCell>
                <TableCell align="right">{dimension.estudiantesEvaluados}</TableCell>
                <TableCell align="right">{dimension.intentosEvaluados}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
