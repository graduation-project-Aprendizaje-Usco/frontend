/**
 * Resultado del diagnóstico (SCRUM-26). Referencia visual: prototipo 09.
 *  - 140: puntaje x/total y categoría con color + icono + texto (nunca solo color).
 *  - 141: barras de % de aciertos por dimensión (recharts) + tabla equivalente para lectores de pantalla.
 *  - 142: dimensiones a reforzar y botón a la práctica.
 * Recibe "resultado" tal cual lo entrega el backend (README-backend §12).
 */
import { useNavigate } from 'react-router';
import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import ReportProblemOutlined from '@mui/icons-material/ReportProblemOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import CheckCircleOutlineOutlined from '@mui/icons-material/CheckCircleOutlineOutlined';

const CATEGORIA = {
  ALTO_RIESGO: { color: 'error', Icono: ReportProblemOutlined },
  RIESGO_MODERADO: { color: 'warning', Icono: WarningAmberOutlined },
  NIVEL_ADECUADO: { color: 'success', Icono: CheckCircleOutlineOutlined },
};

const porcentaje = (valor) => `${Math.round(valor)} %`;

export default function ResultadoDiagnostico({ resultado }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const { color, Icono } = CATEGORIA[resultado.categoria] ?? CATEGORIA.RIESGO_MODERADO;
  const aReforzar = resultado.dimensiones.filter((d) => d.nivel !== 'ALTO');
  const fecha = new Date(resultado.finalizadoEn).toLocaleDateString('es-CO', { dateStyle: 'long' });

  return (
    <Stack spacing={3} sx={{ maxWidth: 820 }}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Resultado de tu diagnóstico
        </Typography>
        <Typography color="text.secondary">
          Presentado el {fecha} · {resultado.total} ítems
        </Typography>
      </Box>

      {resultado.finalizadoPorTiempo && (
        <Alert severity="info">La prueba se entregó sola al terminarse el tiempo.</Alert>
      )}

      {/* 140 · Puntaje y categoría */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Puntaje
          </Typography>
          <Typography sx={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.1 }}>
            {resultado.puntaje}
            <Typography
              component="span"
              color="text.secondary"
              sx={{ fontSize: '1.25rem', fontWeight: 400 }}
            >
              {' '}
              / {resultado.total} correctas
            </Typography>
          </Typography>
        </Paper>
        <Paper
          variant="outlined"
          sx={{ p: 3, borderColor: `${color}.main`, bgcolor: `${color}.light` }}
        >
          <Typography variant="body2" color="text.secondary">
            Categoría
          </Typography>
          <Typography
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: '1.375rem',
              fontWeight: 700,
              color: `${color}.main`,
            }}
          >
            <Icono aria-hidden="true" /> {resultado.categoriaDescripcion}
          </Typography>
        </Paper>
      </Box>

      {/* 141 · Gráfico por dimensión + tabla equivalente */}
      <Paper variant="outlined" component="figure" sx={{ m: 0, p: { xs: 2, sm: 3 } }}>
        <Typography component="figcaption" variant="h6" sx={{ mb: 2 }}>
          Porcentaje de aciertos por dimensión
        </Typography>
        {/* El gráfico es solo visual; la tabla de abajo tiene los mismos datos para lectores de pantalla. */}
        <Box aria-hidden="true" sx={{ height: 56 * resultado.dimensiones.length + 24 }}>
          <ResponsiveContainer>
            <BarChart
              data={resultado.dimensiones}
              layout="vertical"
              margin={{ top: 0, right: 48, bottom: 0, left: 0 }}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                dataKey="nombre"
                width={170}
                tickLine={false}
                axisLine={false}
                tick={{ fill: theme.palette.text.primary, fontSize: 14 }}
              />
              <Tooltip
                cursor={{ fill: theme.palette.action.hover }}
                formatter={(valor, _nombre, { payload }) => [
                  `${porcentaje(valor)} (${payload.aciertos} de ${payload.total})`,
                  'Aciertos',
                ]}
              />
              {/* minPointSize: una barra en 0 % igual se dibuja (2 px) para que muestre su etiqueta "0 %". */}
              <Bar
                dataKey="porcentaje"
                fill={theme.palette.primary.main}
                barSize={20}
                radius={[0, 4, 4, 0]}
                minPointSize={2}
                isAnimationActive={false}
              >
                <LabelList
                  dataKey="porcentaje"
                  position="right"
                  formatter={porcentaje}
                  fill={theme.palette.text.primary}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
        <TableContainer sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell component="th" scope="col">
                  Dimensión
                </TableCell>
                <TableCell component="th" scope="col" align="right">
                  Aciertos
                </TableCell>
                <TableCell component="th" scope="col" align="right">
                  Porcentaje
                </TableCell>
                <TableCell component="th" scope="col">
                  Nivel
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resultado.dimensiones.map((d) => (
                <TableRow key={d.codigo}>
                  <TableCell component="th" scope="row">
                    {d.nombre}
                  </TableCell>
                  <TableCell align="right">
                    {d.aciertos} de {d.total}
                  </TableCell>
                  <TableCell align="right">{porcentaje(d.porcentaje)}</TableCell>
                  <TableCell>{d.nivelDescripcion}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 142 · Recomendaciones y llamado a practicar */}
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {aReforzar.length ? 'Lo que vas a reforzar primero' : '¡Buen punto de partida!'}
        </Typography>
        {aReforzar.length ? (
          <Box component="ul" sx={{ m: 0, mb: 2, pl: 3 }}>
            {aReforzar.map((d) => (
              <li key={d.codigo}>
                <strong>{d.nombre}</strong>: {d.nivelDescripcion.toLowerCase()} (
                {porcentaje(d.porcentaje)} de aciertos).
              </li>
            ))}
          </Box>
        ) : (
          <Typography sx={{ mb: 2 }}>
            Tienes nivel alto en todas las dimensiones. La práctica te ayudará a mantenerlo con
            ejercicios de repaso.
          </Typography>
        )}
        <Button variant="contained" size="large" onClick={() => navigate('/estudiante/practica')}>
          Empezar a practicar
        </Button>
      </Paper>
    </Stack>
  );
}
