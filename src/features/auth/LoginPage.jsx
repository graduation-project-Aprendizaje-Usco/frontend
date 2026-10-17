/**
 * Inicio de sesión (RF-01, SCRUM-87). Referencia visual: prototipo 01 y 02.
 *
 * Accesibilidad (RNF-05):
 *  - labels visibles y asociados a cada campo;
 *  - cada error queda enlazado a su campo con aria-describedby (helperText de MUI);
 *  - al enviar con errores, el foco va al primer campo inválido;
 *  - el error del servidor se anuncia con role="alert";
 *  - todo se puede completar con teclado y se envía con Enter.
 */
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Box, Button, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { login as iniciarSesion } from '../../api/authApi';
import { mensajeDeError } from '../../api/errores';
import MarcaUsco from '../../components/MarcaUsco';
import { useAuth } from '../../context/AuthContext';
import { INICIO_POR_ROL } from '../../routes/navegacion';

const esquema = z.object({
  correo: z
    .string()
    .trim()
    .min(1, 'Escribe tu correo institucional')
    .email('Escribe un correo válido, por ejemplo nombre@usco.edu.co'),
  password: z.string().min(1, 'Escribe tu contraseña'),
});

const inicioDelRol = (rol) => INICIO_POR_ROL[rol] ?? '/no-autorizado';

export default function LoginPage() {
  const { user, login } = useAuth();
  const location = useLocation();
  const [verPassword, setVerPassword] = useState(false);
  const [errorServidor, setErrorServidor] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: { correo: '', password: '' },
  });

  useEffect(() => {
    document.title = 'Iniciar sesión · Aprendizaje USCO';
  }, []);

  // Con sesión abierta (también justo después de login()), se sale de /login: a la ruta que
  // se intentaba abrir (ProtectedRoute la guarda) si es de su rol, o al inicio del rol.
  if (user) {
    const inicio = inicioDelRol(user.rol);
    const desde = location.state?.desde;
    const destino = desde?.pathname.startsWith(inicio) ? `${desde.pathname}${desde.search}` : inicio;
    return <Navigate to={destino} replace />;
  }

  const enviar = async (datos) => {
    setErrorServidor('');
    try {
      login(await iniciarSesion(datos));
    } catch (error) {
      setErrorServidor(mensajeDeError(error, 'No pudimos iniciar sesión. Intenta de nuevo.'));
    }
  };

  // register() devuelve "ref"; MUI lo recibe como inputRef para que el foco al primer error funcione.
  const campo = (nombre) => {
    const { ref, ...resto } = register(nombre);
    return { ...resto, inputRef: ref };
  };

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
        <Box
          component="form"
          noValidate
          onSubmit={handleSubmit(enviar)}
          aria-labelledby="titulo-login"
          sx={{ width: '100%', maxWidth: 400 }}
        >
          <Stack spacing={2.5}>
            <Stack spacing={0.75}>
              <Typography id="titulo-login" variant="h4" component="h1">
                Iniciar sesión
              </Typography>
              <Typography color="text.secondary">Usa tu correo institucional.</Typography>
            </Stack>

            {errorServidor && (
              // Colores del prototipo 02 (fondo rosado, texto rojo): contraste 6.1:1.
              <Alert
                severity="error"
                role="alert"
                sx={{
                  bgcolor: 'error.light',
                  color: 'error.main',
                  border: 1,
                  borderColor: 'error.main',
                  '& .MuiAlert-icon': { color: 'error.main' },
                }}
              >
                {errorServidor}
              </Alert>
            )}

            <TextField
              id="correo"
              label="Correo institucional"
              type="email"
              autoComplete="username"
              placeholder="nombre@usco.edu.co"
              required
              error={Boolean(errors.correo)}
              helperText={errors.correo?.message}
              slotProps={{ inputLabel: { shrink: true } }}
              {...campo('correo')}
            />

            <TextField
              id="password"
              label="Contraseña"
              type={verPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              slotProps={{
                inputLabel: { shrink: true },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setVerPassword((visible) => !visible)}
                        aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        aria-controls="password"
                        edge="end"
                      >
                        {verPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
              {...campo('password')}
            />

            <Button type="submit" variant="contained" size="large" fullWidth loading={isSubmitting}>
              Ingresar
            </Button>

            <Stack direction="row" spacing={1} sx={{ color: 'text.secondary', alignItems: 'flex-start' }}>
              <LockOutlined fontSize="small" aria-hidden="true" sx={{ mt: 0.25 }} />
              <Typography variant="body2">
                Tus datos se tratan conforme a la Ley 1581 de 2012. Antes de ingresar no se muestra información
                académica de ningún usuario.
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
