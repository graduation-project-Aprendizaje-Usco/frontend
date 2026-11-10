import { Paper, Typography } from '@mui/material';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import { formatearPorcentaje } from '../../progreso/utils/formatearProgreso';

export default function DimensionMasDebil({ dimension }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, height: '100%' }}>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
        Dimensión más débil
      </Typography>
      {dimension ? (
        <>
          <Typography variant="h5" component="p" sx={{ mt: 0.5, fontWeight: 700 }}>
            {dimension.nombre}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Promedio del grupo: {formatearPorcentaje(dimension.promedio)} ·{' '}
            {dimension.estudiantesEvaluados} estudiante(s)
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <WarningAmberOutlined fontSize="small" color="warning" aria-hidden="true" />
            Prioriza actividades de esta competencia.
          </Typography>
        </>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Aún no hay actividad suficiente para identificar una dimensión débil.
        </Typography>
      )}
    </Paper>
  );
}
