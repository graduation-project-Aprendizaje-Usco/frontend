import { useEffect } from 'react';
import { Stack, Typography } from '@mui/material';
import HistorialResultados from '../../components/HistorialResultados';

/**
 * Mi progreso (RF-09, RF-15). Por ahora solo el historial (SCRUM-41); los indicadores
 * del dashboard de progreso (SCRUM-38) se agregan arriba del historial.
 */
export default function ProgresoPage() {
  useEffect(() => {
    document.title = 'Mi progreso · Aprendizaje USCO';
  }, []);

  return (
    <Stack spacing={3} sx={{ maxWidth: 1000 }}>
      <Typography variant="h4" component="h1">
        Mi progreso
      </Typography>
      <HistorialResultados />
    </Stack>
  );
}
