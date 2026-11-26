import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, Link, Stack, TextField, Typography } from '@mui/material';
import { activarCuenta } from '../../api/authApi';
import { mensajeDeError } from '../../api/errores';
import PlantillaAcceso from './PlantillaAcceso';
import { MENSAJE_PASSWORD, PASSWORD_MAX, PASSWORD_MIN, PATRON_PASSWORD } from './reglasRegistro';

const esquema = z
  .object({
    password: z
      .string()
      .min(PASSWORD_MIN, `La contraseña debe tener mínimo ${PASSWORD_MIN} caracteres`)
      .max(PASSWORD_MAX, `La contraseña puede tener máximo ${PASSWORD_MAX} caracteres`)
      .regex(PATRON_PASSWORD, MENSAJE_PASSWORD),
    confirmarPassword: z.string().min(1, 'Repite tu contraseña'),
  })
  .refine((datos) => datos.password === datos.confirmarPassword, {
    path: ['confirmarPassword'],
    message: 'Las contraseñas no coinciden',
  });

export default function ActivarCuentaPage() {
  const [parametros] = useSearchParams();
  const navigate = useNavigate();
  const token = parametros.get('token');
  const [errorServidor, setErrorServidor] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: { password: '', confirmarPassword: '' },
  });

  useEffect(() => {
    document.title = 'Configurar contraseña · Aprendizaje USCO';
  }, []);

  const enviar = async ({ password }) => {
    setErrorServidor('');
    try {
      await activarCuenta({ token, password });
      navigate('/login', { state: { cuentaActivada: true } });
    } catch (error) {
      setErrorServidor(mensajeDeError(error, 'No pudimos configurar tu contraseña. Solicita un nuevo enlace al administrador.'));
    }
  };

  if (!token) {
    return (
      <PlantillaAcceso>
        <Stack spacing={2}>
          <Typography variant="h4" component="h1">Configurar contraseña</Typography>
          <Alert severity="error" role="alert">El enlace no contiene un token válido.</Alert>
          <Link component={RouterLink} to="/login">Volver al inicio de sesión</Link>
        </Stack>
      </PlantillaAcceso>
    );
  }

  const campo = (nombre) => {
    const { ref, ...resto } = register(nombre);
    return { ...resto, inputRef: ref };
  };

  return (
    <PlantillaAcceso>
      <Stack component="form" noValidate onSubmit={handleSubmit(enviar)} aria-labelledby="titulo-activar" spacing={2.5}>
        <Stack spacing={0.75}>
          <Typography id="titulo-activar" variant="h4" component="h1">
            Configura tu contraseña
          </Typography>
          <Typography color="text.secondary">
            Elige una contraseña para ingresar a Aprendizaje USCO. El enlace solo puede usarse una vez.
          </Typography>
        </Stack>

        {errorServidor && <Alert severity="error" role="alert">{errorServidor}</Alert>}

        <TextField
          id="password"
          label="Nueva contraseña"
          type="password"
          autoComplete="new-password"
          required
          error={Boolean(errors.password)}
          helperText={errors.password?.message ?? 'Mínimo 8 caracteres, con al menos una letra y un número.'}
          {...campo('password')}
        />
        <TextField
          id="confirmarPassword"
          label="Confirmar contraseña"
          type="password"
          autoComplete="new-password"
          required
          error={Boolean(errors.confirmarPassword)}
          helperText={errors.confirmarPassword?.message}
          {...campo('confirmarPassword')}
        />

        <Button type="submit" variant="contained" size="large" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : 'Guardar contraseña'}
        </Button>
      </Stack>
    </PlantillaAcceso>
  );
}
