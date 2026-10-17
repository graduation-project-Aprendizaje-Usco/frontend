import { Box, CircularProgress } from '@mui/material';

/** Indicador mientras llega el archivo de una página cargada con lazy() (normalmente una fracción de segundo). */
export default function CargandoPagina() {
  return (
    <Box role="status" aria-label="Cargando página" sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <CircularProgress />
    </Box>
  );
}
