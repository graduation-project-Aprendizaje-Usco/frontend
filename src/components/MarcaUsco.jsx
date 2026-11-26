import { useState } from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Logo institucional + nombre de la plataforma, para fondos vino (AppBar).
 * El archivo public/img/usco-logo-blanco.png es la "Versión Blanco, mediana
 * (235 x 60 px)" del Manual de Identidad Visual. Si falta, queda solo el texto.
 * En pantallas pequeñas (< 600 px) se muestra solo el texto.
 */
export default function MarcaUsco() {
  const [logoDisponible, setLogoDisponible] = useState(true);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
      {logoDisponible && (
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.5 }}>
          <Box
            component="img"
            src="/img/usco-logo-blanco.png"
            alt="Universidad Surcolombiana"
            onError={() => setLogoDisponible(false)}
            sx={{ height: 36, width: 'auto', display: 'block' }}
          />
          <Box aria-hidden="true" sx={{ width: '1px', height: 28, bgcolor: 'rgba(255,255,255,0.45)' }} />
        </Box>
      )}
      <Typography component="span" sx={{ fontWeight: 700, fontSize: { xs: '1rem', sm: '1.125rem' }, whiteSpace: 'nowrap' }}>
        Aprendizaje USCO
      </Typography>
    </Box>
  );
}
