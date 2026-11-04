import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
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
import {
  ESTADO_VARIACION,
  formatearNivel,
  formatearPorcentaje,
  formatearPuntosPorcentuales,
} from '../utils/formatearProgreso';

export default function GraficaDimensiones({ dimensiones = [] }) {
  const theme = useTheme();

  // Preparamos los datos para Recharts sin convertir null en 0:
  // Si no tiene actividad o es null, porcentajeGrafica es null para que no dibuje una barra errónea de 0%
  const datosGrafica = dimensiones.map((dim) => ({
    ...dim,
    porcentajeGrafica: dim.sinActividad || dim.porcentajeAciertos === null ? null : Number(dim.porcentajeAciertos),
  }));

  // Paleta de dimensiones por código o color institucional por defecto
  const obtenerColorBarra = (codigo) => {
    const cod = (codigo || '').toLowerCase();
    if (cod.includes('alg') || cod.includes('dim_1')) return theme.palette.dimension?.algebraica || '#B45309';
    if (cod.includes('log') || cod.includes('dim_2')) return theme.palette.dimension?.logica || '#00875A';
    if (cod.includes('fun') || cod.includes('dim_3')) return theme.palette.dimension?.funcional || '#4F46E5';
    return theme.palette.primary.main;
  };

  return (
    <Paper variant="outlined" component="figure" sx={{ m: 0, p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography component="figcaption" variant="h6" sx={{ fontWeight: 700 }}>
          Rendimiento por dimensión
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Porcentaje de aciertos e indicadores de desempeño en cada competencia evaluada
        </Typography>
      </Box>

      {/* Contenedor Recharts accesible (oculto a lectores de pantalla) */}
      <Box aria-hidden="true" sx={{ height: Math.max(180, 70 * dimensiones.length + 30), width: '100%', my: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={datosGrafica} layout="vertical" margin={{ top: 10, right: 60, bottom: 10, left: 20 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
            <YAxis
              type="category"
              dataKey="nombre"
              width={160}
              tickLine={false}
              axisLine={false}
              tick={{ fill: theme.palette.text.primary, fontSize: 13, fontWeight: 500 }}
            />
            <Tooltip
              cursor={{ fill: theme.palette.action.hover }}
              formatter={(valor, _nombre, { payload }) => {
                if (payload.sinActividad || payload.porcentajeAciertos === null) {
                  return ['Sin actividad registrada', 'Aciertos'];
                }
                return [
                  `${formatearPorcentaje(valor)} (${payload.intentosCorrectos} de ${payload.intentosEvaluados})`,
                  'Aciertos',
                ];
              }}
            />
            <Bar dataKey="porcentajeGrafica" barSize={22} radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {datosGrafica.map((entry) => (
                <Cell key={`cell-${entry.codigo || entry.competenciaId}`} fill={obtenerColorBarra(entry.codigo)} />
              ))}
              <LabelList
                dataKey="porcentajeGrafica"
                position="right"
                formatter={(val) => (val !== null && val !== undefined ? `${Math.round(val)} %` : 'Sin act.')}
                fill={theme.palette.text.primary}
                style={{ fontSize: '12px', fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Tabla semántica equivalente para lectores de pantalla y consulta detallada */}
      <TableContainer sx={{ mt: 3 }}>
        <Table size="small" aria-label="Tabla de rendimiento y variación por dimensión">
          <TableHead>
            <TableRow>
              <TableCell component="th" scope="col">
                Dimensión
              </TableCell>
              <TableCell component="th" scope="col" align="right">
                Aciertos
              </TableCell>
              <TableCell component="th" scope="col" align="right">
                % Aciertos
              </TableCell>
              <TableCell component="th" scope="col">
                Nivel
              </TableCell>
              <TableCell component="th" scope="col" align="right">
                Diagnóstico
              </TableCell>
              <TableCell component="th" scope="col">
                Variación
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dimensiones.map((d) => {
              const variacionConfig = ESTADO_VARIACION[d.estadoVariacion] || {
                etiqueta: d.estadoVariacion || '—',
                color: 'default',
              };

              return (
                <TableRow key={d.competenciaId || d.codigo}>
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {d.nombre}
                    </Typography>
                    {d.codigo && (
                      <Typography variant="caption" color="text.secondary">
                        {d.codigo}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {d.sinActividad ? '—' : `${d.intentosCorrectos} de ${d.intentosEvaluados}`}
                  </TableCell>
                  <TableCell align="right">
                    {d.sinActividad || d.porcentajeAciertos === null ? (
                      <Typography variant="body2" color="text.secondary" component="span">
                        Sin actividad
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ fontWeight: 600 }} component="span">
                        {formatearPorcentaje(d.porcentajeAciertos)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{d.sinActividad ? 'Sin evaluar' : formatearNivel(d.nivel)}</TableCell>
                  <TableCell align="right">{formatearPorcentaje(d.porcentajeDiagnostico)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        size="small"
                        label={variacionConfig.etiqueta}
                        color={variacionConfig.color}
                        variant="outlined"
                      />
                      {d.variacionPuntosPorcentuales !== null && d.variacionPuntosPorcentuales !== undefined && (
                        <Typography variant="caption" color="text.secondary">
                          ({formatearPuntosPorcentuales(d.variacionPuntosPorcentuales)})
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

