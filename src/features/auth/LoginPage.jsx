/**
 * PROVISIONAL: pantalla para entrar con un rol de prueba y verificar rutas y
 * layouts. Fernando la reemplaza por el login real (correo + contraseña contra
 * POST /api/auth/login). Los botones de prueba solo existen en `npm run dev`;
 * en un build de producción no se muestran.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { INICIO_POR_ROL, ROLES } from '../../routes/navegacion';

const USUARIOS_DE_PRUEBA = [
  { id: 1, nombres: 'Estudiante de prueba', correo: 'estudiante@usco.edu.co', rol: ROLES.ESTUDIANTE },
  { id: 2, nombres: 'Docente de prueba', correo: 'docente@usco.edu.co', rol: ROLES.DOCENTE },
  { id: 3, nombres: 'Administrador de prueba', correo: 'admin@usco.edu.co', rol: ROLES.ADMIN },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Iniciar sesión · Aprendizaje USCO';
  }, []);

  const entrarComo = (usuario) => {
    login({ token: null, usuario });
    navigate(INICIO_POR_ROL[usuario.rol], { replace: true });
  };

  return (
    <Box component="main" sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2, bgcolor: 'background.default' }}>
      <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, maxWidth: 420, width: '100%' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Iniciar sesión
        </Typography>
        <Alert severity="info" sx={{ mb: 3 }}>
          Pantalla provisional. El formulario real con correo y contraseña llega con la tarea de login.
        </Alert>
        {import.meta.env.DEV && (
          <Stack spacing={1.5}>
            {USUARIOS_DE_PRUEBA.map((usuario) => (
              <Button key={usuario.rol} variant="contained" size="large" onClick={() => entrarComo(usuario)}>
                Entrar como {usuario.nombres.replace(' de prueba', '').toLowerCase()}
              </Button>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
