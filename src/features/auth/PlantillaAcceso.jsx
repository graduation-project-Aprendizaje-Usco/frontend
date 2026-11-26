/**
 * Estructura común de las pantallas de acceso (login y registro): panel
 * institucional a la izquierda (solo desde 900 px) y el formulario a la derecha.
 * Referencia visual: prototipo 01 y 02.
 */
import { Box, Stack, Typography } from '@mui/material';
import MarcaUsco from '../../components/MarcaUsco';

export default function PlantillaAcceso({ children, anchoFormulario = 400 }) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      {/* Panel institucional: solo desde 900 px; en celular se muestra solo el formulario. */}
      <Box
        component="aside"
        className="fondo-oscuro"
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: { md: 440, lg: 520 },
          flexShrink: 0,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          px: 6,
          py: 7,
        }}
      >
        <MarcaUsco />
        <Stack spacing={2.25}>
          <Typography component="p" sx={{ fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.15 }}>
            Diagnostica, practica y sigue tu avance en Cálculo Diferencial.
          </Typography>
          <Typography sx={{ opacity: 0.9, maxWidth: 380 }}>
            Prueba inicial de 24 ítems, práctica ajustada a tus resultados y retroalimentación en cada intento.
          </Typography>
        </Stack>
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
          Universidad Surcolombiana · Facultad de Ingeniería
          <br />
          Piloto académico 2026-2
        </Typography>
      </Box>

      <Box
        component="main"
        sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2, py: 4 }}
      >
        <Box sx={{ width: '100%', maxWidth: anchoFormulario }}>{children}</Box>
      </Box>
    </Box>
  );
}
