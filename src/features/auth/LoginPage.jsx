/**
 * Inicio de sesión (RF-01, SCRUM-87). Referencia visual: prototipo 01 y 02.
 *
 * Accesibilidad (RNF-05):
 *  - labels visibles y asociados a cada campo;
 *  - cada error queda enlazado a su campo con aria-describedby (helperText de MUI);
 *  - al enviar con errores, el foco va al primer campo inválido;
 *  - el error del servidor se anuncia con role="alert";
 *  - todo se puede completar con teclado y se envía con Enter.
 *
 * Si llega desde el registro (state.registrado), muestra el aviso de cuenta
 * creada y deja el correo ya escrito.
 */
import { useEffect, useState } from 'react';
import { Navigate, Link as RouterLink, useLocation } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, IconButton, InputAdornment, Link, Stack, TextField, Typography } from '@mui/material';
import LockOutlined from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { login as iniciarSesion } from '../../api/authApi';
import { mensajeDeError } from '../../api/errores';
import { useAuth } from '../../context/AuthContext';
import { INICIO_POR_ROL } from '../../routes/navegacion';
import PlantillaAcceso from './PlantillaAcceso';

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
  const recienRegistrado = Boolean(location.state?.registrado);
  const [verPassword, setVerPassword] = useState(false);
  const [errorServidor, setErrorServidor] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: { correo: location.state?.correo ?? '', password: '' },
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
    <PlantillaAcceso>
      <Stack component="form" noValidate onSubmit={handleSubmit(enviar)} aria-labelledby="titulo-login" spacing={2.5}>
        <Stack spacing={0.75}>
          <Typography id="titulo-login" variant="h4" component="h1">
            Iniciar sesión
          </Typography>
          <Typography color="text.secondary">Usa tu correo institucional.</Typography>
        </Stack>

        {recienRegistrado && !errorServidor && (
          <Alert severity="success" role="status">
            Tu cuenta quedó creada. Inicia sesión con tu correo y tu contraseña.
          </Alert>
        )}

        {errorServidor && (
          <Alert severity="error" role="alert">
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
          autoFocus={recienRegistrado}
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

        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          ¿Eres estudiante y aún no tienes cuenta?{' '}
          <Link component={RouterLink} to="/registro" sx={{ fontWeight: 600 }}>
            Crear cuenta
          </Link>
        </Typography>

        <Stack direction="row" spacing={1} sx={{ color: 'text.secondary', alignItems: 'flex-start' }}>
          <LockOutlined fontSize="small" aria-hidden="true" sx={{ mt: 0.25 }} />
          <Typography variant="body2">
            Tus datos se tratan conforme a la Ley 1581 de 2012. Antes de ingresar no se muestra información
            académica de ningún usuario.
          </Typography>
        </Stack>
      </Stack>
    </PlantillaAcceso>
  );
}
