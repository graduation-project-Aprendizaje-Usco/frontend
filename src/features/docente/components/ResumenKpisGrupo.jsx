import { Box, Paper, Typography } from '@mui/material';
import PeopleOutlined from '@mui/icons-material/PeopleOutlined';
import PlayCircleOutlineOutlined from '@mui/icons-material/PlayCircleOutlineOutlined';
import PercentOutlined from '@mui/icons-material/PercentOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import { formatearPorcentaje } from '../../progreso/utils/formatearProgreso';

const INDICADORES = [
  {
    clave: 'totalEstudiantes',
    etiqueta: 'Estudiantes',
    detalle: 'Inscritos en el grupo',
    icono: PeopleOutlined,
    color: 'primary.main',
  },
  {
    clave: 'estudiantesConActividad',
    etiqueta: 'Con actividad',
    detalle: 'Con práctica registrada',
    icono: PlayCircleOutlineOutlined,
    color: 'info.main',
  },
  {
    clave: 'promedioGeneral',
    etiqueta: 'Promedio general',
    detalle: 'Aciertos del grupo',
    icono: PercentOutlined,
    color: 'success.main',
    formato: formatearPorcentaje,
  },
  {
    clave: 'estudiantesEnRiesgo',
    etiqueta: 'En riesgo',
    detalle: 'Requieren acompañamiento',
    icono: WarningAmberOutlined,
    color: 'error.main',
  },
];

export default function ResumenKpisGrupo({ resumen }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 2,
      }}
    >
      {INDICADORES.map((indicador) => {
        const Icono = indicador.icono;
        const valor = resumen[indicador.clave];
        return (
          <Paper key={indicador.clave} variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {indicador.etiqueta}
              </Typography>
              <Icono fontSize="small" aria-hidden="true" sx={{ color: indicador.color }} />
            </Box>
            <Typography variant="h5" component="p" sx={{ fontWeight: 700 }}>
              {indicador.formato ? indicador.formato(valor) : (valor ?? 0)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {indicador.detalle}
            </Typography>
          </Paper>
        );
      })}
    </Box>
  );
}
