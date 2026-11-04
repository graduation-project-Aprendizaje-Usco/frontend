import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import AutoGraphOutlined from '@mui/icons-material/AutoGraphOutlined';
import PercentOutlined from '@mui/icons-material/PercentOutlined';
import CheckCircleOutlineOutlined from '@mui/icons-material/CheckCircleOutlineOutlined';
import TouchAppOutlined from '@mui/icons-material/TouchAppOutlined';
import { formatearNivel, formatearPorcentaje } from '../utils/formatearProgreso';

export default function ResumenKpis({ progreso }) {
  const kpis = [
    {
      id: 'nivel-general',
      etiqueta: 'Nivel general',
      valor: formatearNivel(progreso.nivelGeneral),
      descripcion: 'Nivel de dominio consolidado en las dimensiones',
      icono: AutoGraphOutlined,
      colorIcono: 'primary.main',
    },
    {
      id: 'porcentaje-general',
      etiqueta: 'Porcentaje general',
      valor: formatearPorcentaje(progreso.porcentajeGeneral),
      descripcion: 'Promedio de aciertos en ejercicios evaluados',
      icono: PercentOutlined,
      colorIcono: 'secondary.main',
    },
    {
      id: 'ejercicios-completados',
      etiqueta: 'Ejercicios completados',
      valor: progreso.ejerciciosCompletados ?? 0,
      descripcion: 'Ejercicios resueltos exitosamente',
      icono: CheckCircleOutlineOutlined,
      colorIcono: 'success.main',
    },
    {
      id: 'total-intentos',
      etiqueta: 'Total de intentos',
      valor: progreso.totalIntentos ?? 0,
      descripcion: 'Intentos evaluados registrados',
      icono: TouchAppOutlined,
      colorIcono: 'info.main',
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)',
        },
        gap: 2,
      }}
    >
      {kpis.map((kpi) => {
        const Icono = kpi.icono;
        return (
          <Paper
            key={kpi.id}
            variant="outlined"
            sx={{
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              borderRadius: 2,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {kpi.etiqueta}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: 'action.hover',
                  color: kpi.colorIcono,
                }}
              >
                <Icono fontSize="small" aria-hidden="true" />
              </Box>
            </Box>

            <Box sx={{ my: 0.5 }}>
              <Typography
                component="div"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '1.75rem' },
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: 'text.primary',
                }}
              >
                {kpi.valor}
              </Typography>
            </Box>

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {kpi.descripcion}
            </Typography>
          </Paper>
        );
      })}
    </Box>
  );
}
