import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router';
import { Box, Button, Paper, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { INICIO_POR_ROL } from '../../routes/navegacion';

/** Página de error a pantalla completa (fuera de los layouts). */
export default function PaginaError({ codigo, titulo, mensaje, icono: Icono }) {
  const { user } = useAuth();
  const destino = user ? (INICIO_POR_ROL[user.rol] ?? '/') : '/login';

  useEffect(() => {
    document.title = `${titulo} · Aprendizaje USCO`;
  }, [titulo]);

  return (
    <Box
      component="main"
      sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, bgcolor: 'background.default' }}
    >
      <Paper variant="outlined" sx={{ p: { xs: 3, sm: 5 }, maxWidth: 520, width: '100%', textAlign: 'center' }}>
        {Icono && <Icono sx={{ fontSize: 56, color: 'primary.main', mb: 1 }} aria-hidden="true" />}
        <Typography variant="overline" component="p" sx={{ color: 'text.secondary', fontWeight: 700 }}>
          Error {codigo}
        </Typography>
        <Typography variant="h4" component="h1" gutterBottom>
          {titulo}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {mensaje}
        </Typography>
        <Button component={RouterLink} to={destino} variant="contained" size="large">
          {user ? 'Ir a mi inicio' : 'Ir a iniciar sesión'}
        </Button>
      </Paper>
    </Box>
  );
}
