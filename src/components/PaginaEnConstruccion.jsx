import { useEffect } from 'react';
import { Box, Chip, Paper, Typography } from '@mui/material';
import ConstructionOutlined from '@mui/icons-material/ConstructionOutlined';

/**
 * Página provisional. Cada integrante reemplaza el contenido del archivo de su
 * pantalla en features/ por la implementación real.
 */
export default function PaginaEnConstruccion({ titulo, descripcion, responsable }) {
  useEffect(() => {
    document.title = `${titulo} · Aprendizaje USCO`;
  }, [titulo]);

  return (
    <Box sx={{ maxWidth: 880 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {titulo}
      </Typography>
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <ConstructionOutlined sx={{ color: 'warning.main', fontSize: 32, flexShrink: 0 }} aria-hidden="true" />
        <Box sx={{ minWidth: 0 }}>
          <Chip label="En construcción" color="warning" size="small" sx={{ mb: 1 }} />
          {descripcion && <Typography sx={{ mb: 0.5 }}>{descripcion}</Typography>}
          {responsable && (
            <Typography variant="body2" color="text.secondary">
              Responsable: {responsable}
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
