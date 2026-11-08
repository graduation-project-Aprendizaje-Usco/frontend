/**
 * Registro de estudiantes (RF-01, hallazgo 1 de la revisión).
 *
 * Aplica las mismas reglas del backend (reglasRegistro.js ↔ RegistroRequest.java):
 * correo de estudiante (u + 11 dígitos + @usco.edu.co), contraseña con letra y
 * número, y programa académico de la lista cerrada. Los errores que devuelva el
 * backend (400 por campo, 409 correo repetido) se muestran en su campo.
 *
 * Al registrarse vuelve a /login con el aviso de cuenta creada y el correo ya escrito.
 *
 * Pendiente (bloque "registro por invitación"): la pantalla se abrirá desde el enlace
 * de la invitación (/registro?invitacion=…) con el correo fijo.
 *
 * Accesibilidad (RNF-05): igual que el login — labels visibles, errores enlazados
 * a su campo, foco al primer campo inválido y error general con role="alert".
 */
import { useEffect, useState } from 'react';
import { Navigate, Link as RouterLink, useNavigate } from 'react-router';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert,
  Button,
  IconButton,
  InputAdornment,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { registro } from '../../api/authApi';
import { asignarErroresDeCampos } from '../../api/campos';
import { mensajeDeError } from '../../api/errores';
import { useAuth } from '../../context/AuthContext';
import { INICIO_POR_ROL } from '../../routes/navegacion';
import PlantillaAcceso from './PlantillaAcceso';
import {
  MENSAJE_CORREO_ESTUDIANTE,
  MENSAJE_PASSWORD,
  PASSWORD_MAX,
  PASSWORD_MIN,
  PATRON_CORREO_ESTUDIANTE,
  PATRON_PASSWORD,
  PROGRAMAS_ACADEMICOS,
} from './reglasRegistro';

const esquema = z
  .object({
    nombres: z.string().trim().min(1, 'Escribe tus nombres').max(100, 'Máximo 100 caracteres'),
    apellidos: z.string().trim().min(1, 'Escribe tus apellidos').max(100, 'Máximo 100 caracteres'),
    correo: z
      .string()
      .trim()
      .min(1, 'Escribe tu correo institucional')
      .regex(PATRON_CORREO_ESTUDIANTE, MENSAJE_CORREO_ESTUDIANTE),
    programaAcademico: z
      .string()
      .refine((valor) => PROGRAMAS_ACADEMICOS.includes(valor), 'Elige tu programa académico'),
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

const CAMPOS = ['nombres', 'apellidos', 'correo', 'programaAcademico', 'password'];

export default function RegistroPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [verPassword, setVerPassword] = useState(false);
  const [errorServidor, setErrorServidor] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      nombres: '',
      apellidos: '',
      correo: '',
      programaAcademico: '',
      password: '',
      confirmarPassword: '',
    },
  });

  useEffect(() => {
    document.title = 'Crear cuenta · Aprendizaje USCO';
  }, []);

  // Con sesión abierta no tiene sentido registrarse: al inicio de su rol.
  if (user) return <Navigate to={INICIO_POR_ROL[user.rol] ?? '/no-autorizado'} replace />;

  const enviar = async ({ nombres, apellidos, correo: correoEscrito, programaAcademico, password }) => {
    setErrorServidor('');
    const correo = correoEscrito.trim().toLowerCase();
    try {
      // confirmarPassword no se envía: solo se usa en el formulario.
      await registro({ nombres, apellidos, correo, programaAcademico, password });
      navigate('/login', { state: { registrado: true, correo } });
    } catch (error) {
      if (error?.response?.status === 409) {
        setError('correo', { type: 'servidor', message: mensajeDeError(error) }, { shouldFocus: true });
        return;
      }
      if (!asignarErroresDeCampos(error, setError, CAMPOS)) {
        setErrorServidor(mensajeDeError(error, 'No pudimos crear tu cuenta. Intenta de nuevo.'));
      }
    }
  };

  // register() devuelve "ref"; MUI lo recibe como inputRef para que el foco al primer error funcione.
  const campo = (nombre) => {
    const { ref, ...resto } = register(nombre);
    return { ...resto, inputRef: ref };
  };

  const textoAyuda = (nombre, ayuda) => errors[nombre]?.message ?? ayuda;
  const verOcultar = (
    <InputAdornment position="end">
      <IconButton
        onClick={() => setVerPassword((visible) => !visible)}
        aria-label={verPassword ? 'Ocultar contraseñas' : 'Mostrar contraseñas'}
        aria-controls="password confirmarPassword"
        edge="end"
      >
        {verPassword ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <PlantillaAcceso anchoFormulario={460}>
      <Stack
        component="form"
        noValidate
        onSubmit={handleSubmit(enviar)}
        aria-labelledby="titulo-registro"
        spacing={2.5}
      >
        <Stack spacing={0.75}>
          <Typography id="titulo-registro" variant="h4" component="h1">
            Crear cuenta
          </Typography>
          <Typography color="text.secondary">Registro para estudiantes con correo institucional.</Typography>
        </Stack>

        {errorServidor && (
          <Alert severity="error" role="alert">
            {errorServidor}
          </Alert>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            id="nombres"
            label="Nombres"
            autoComplete="given-name"
            required
            fullWidth
            error={Boolean(errors.nombres)}
            helperText={errors.nombres?.message}
            slotProps={{ inputLabel: { shrink: true } }}
            {...campo('nombres')}
          />
          <TextField
            id="apellidos"
            label="Apellidos"
            autoComplete="family-name"
            required
            fullWidth
            error={Boolean(errors.apellidos)}
            helperText={errors.apellidos?.message}
            slotProps={{ inputLabel: { shrink: true } }}
            {...campo('apellidos')}
          />
        </Stack>

        <TextField
          id="correo"
          label="Correo institucional"
          type="email"
          autoComplete="username"
          placeholder="u20201234567@usco.edu.co"
          required
          error={Boolean(errors.correo)}
          helperText={textoAyuda('correo', 'u + tu código de 11 dígitos + @usco.edu.co')}
          slotProps={{ inputLabel: { shrink: true } }}
          {...campo('correo')}
        />

        {/* El selector de MUI es "controlado": se conecta con Controller en vez de register(). */}
        <Controller
          name="programaAcademico"
          control={control}
          render={({ field: { ref, ...field } }) => (
            <TextField
              id="programaAcademico"
              label="Programa académico"
              select
              required
              inputRef={ref}
              error={Boolean(errors.programaAcademico)}
              helperText={errors.programaAcademico?.message}
              slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
              {...field}
            >
              <MenuItem value="" disabled>
                Elige tu programa
              </MenuItem>
              {PROGRAMAS_ACADEMICOS.map((programa) => (
                <MenuItem key={programa} value={programa}>
                  {programa}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <TextField
          id="password"
          label="Contraseña"
          type={verPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          error={Boolean(errors.password)}
          helperText={textoAyuda('password', `Mínimo ${PASSWORD_MIN} caracteres, con al menos una letra y un número`)}
          slotProps={{ inputLabel: { shrink: true }, input: { endAdornment: verOcultar } }}
          {...campo('password')}
        />

        <TextField
          id="confirmarPassword"
          label="Confirmar contraseña"
          type={verPassword ? 'text' : 'password'}
          autoComplete="new-password"
          required
          error={Boolean(errors.confirmarPassword)}
          helperText={errors.confirmarPassword?.message}
          slotProps={{ inputLabel: { shrink: true } }}
          {...campo('confirmarPassword')}
        />

        <Button type="submit" variant="contained" size="large" fullWidth loading={isSubmitting}>
          Crear cuenta
        </Button>

        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          ¿Ya tienes cuenta?{' '}
          <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>
            Inicia sesión
          </Link>
        </Typography>
      </Stack>
    </PlantillaAcceso>
  );
}
