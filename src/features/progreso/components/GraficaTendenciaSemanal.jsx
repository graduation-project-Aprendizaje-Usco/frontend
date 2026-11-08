import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import PlayArrowOutlined from '@mui/icons-material/PlayArrowOutlined';
import TimelineOutlined from '@mui/icons-material/TimelineOutlined';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatearPorcentaje } from '../utils/formatearProgreso';

export default function GraficaTendenciaSemanal({ tendencia = [] }) {
  const theme = useTheme();
  const navigate = useNavigate();

  // Escenario 1: Cero semanas registradas
  if (!tendencia || tendencia.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, textAlign: 'center', borderRadius: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 1.5,
          }}
        >
          <TimelineOutlined />
        </Box>
        <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
          Evolución semanal
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: 'auto', mb: 2.5 }}>
          Aún no se registran semanas con intentos evaluados. Completa sesiones de práctica regularmente para observar la
          evolución de tu rendimiento a lo largo del tiempo.
        </Typography>
        <Button variant="outlined" startIcon={<PlayArrowOutlined />} onClick={() => navigate('/estudiante/practica')}>
          Comenzar práctica
        </Button>
      </Paper>
    );
  }

  // Preparamos datos reales sin inventar semanas artificiales
  const datosGrafica = tendencia.map((item) => ({
    ...item,
    porcentajeNumerico: Number(item.porcentajeAciertos),
  }));

  const esSemanaUnica = tendencia.length === 1;

  return (
    <Paper variant="outlined" component="figure" sx={{ m: 0, p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography component="figcaption" variant="h6" sx={{ fontWeight: 700 }}>
          Evolución semanal del rendimiento
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Tendencia de aciertos en las semanas con actividad evaluada
        </Typography>
      </Box>

      {/* Mensaje amigable cuando solo hay una semana registrada */}
      {esSemanaUnica && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 1.5,
            mb: 2,
            borderRadius: 1.5,
            bgcolor: 'action.hover',
            color: 'text.secondary',
          }}
        >
          <InfoOutlined fontSize="small" color="primary" />
          <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500 }}>
            Registras una semana evaluada. La línea de progresión y comparación temporal se trazará automáticamente a
            medida que practiques en semanas posteriores.
          </Typography>
        </Box>
      )}

      {/* Contenedor Recharts */}
      <Box aria-hidden="true" sx={{ height: 280, width: '100%', my: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={datosGrafica} margin={{ top: 20, right: 30, bottom: 10, left: 0 }} accessibilityLayer={false}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} vertical={false} />
            <XAxis
              dataKey="etiqueta"
              padding={{ left: esSemanaUnica ? 60 : 20, right: esSemanaUnica ? 60 : 20 }}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: theme.palette.divider }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: theme.palette.divider }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                borderColor: theme.palette.divider,
                borderRadius: 8,
              }}
              formatter={(valor, _nombre, { payload }) => [
                `${formatearPorcentaje(valor)} (${payload.intentosCorrectos} de ${payload.intentosEvaluados} aciertos)`,
                'Rendimiento',
              ]}
              labelFormatter={(etiqueta) => `Semana: ${etiqueta}`}
            />
            <Line
              type="monotone"
              dataKey="porcentajeNumerico"
              stroke={theme.palette.primary.main}
              strokeWidth={3}
              dot={{ fill: theme.palette.primary.main, r: 6 }}
              activeDot={{ r: 8 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* Tabla semántica accesible con los mismos datos */}
      <TableContainer sx={{ mt: 2 }}>
        <Table size="small" aria-label="Tabla de evolución semanal">
          <TableHead>
            <TableRow>
              <TableCell component="th" scope="col">
                Semana
              </TableCell>
              <TableCell component="th" scope="col" align="right">
                Intentos evaluados
              </TableCell>
              <TableCell component="th" scope="col" align="right">
                Aciertos
              </TableCell>
              <TableCell component="th" scope="col" align="right">
                % Rendimiento
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tendencia.map((t) => (
              <TableRow key={`${t.anio}-${t.semana}`}>
                <TableCell component="th" scope="row">
                  {t.etiqueta}
                </TableCell>
                <TableCell align="right">{t.intentosEvaluados}</TableCell>
                <TableCell align="right">{t.intentosCorrectos}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {formatearPorcentaje(t.porcentajeAciertos)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
