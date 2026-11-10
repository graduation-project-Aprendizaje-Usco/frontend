import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { actualizar, crear } from '../../api/adminUsuariosApi';
import { mensajeDeError } from '../../api/errores';
import { ETIQUETA_ROL, ROLES } from '../../routes/navegacion';
import {
  MENSAJE_CORREO_ESTUDIANTE,
  PATRON_CORREO_ESTUDIANTE,
  PROGRAMAS_ACADEMICOS,
} from '../auth/reglasRegistro';

// Mismas reglas que el backend: un estudiante necesita correo de estudiante y programa.
const esquema = z
  .object({
    nombres: z.string().trim().min(1, 'Los nombres son obligatorios').max(100),
    apellidos: z.string().trim().min(1, 'Los apellidos son obligatorios').max(100),
    correo: z.string().trim().min(1, 'El correo es obligatorio').email('El correo no es válido').max(150),
    rol: z.enum([ROLES.ESTUDIANTE, ROLES.DOCENTE, ROLES.ADMIN]),
    programaAcademico: z.string(),
  })
  .superRefine((datos, ctx) => {
    if (datos.rol !== ROLES.ESTUDIANTE) return;
    if (!PATRON_CORREO_ESTUDIANTE.test(datos.correo.trim())) {
      ctx.addIssue({ code: 'custom', path: ['correo'], message: MENSAJE_CORREO_ESTUDIANTE });
    }
    if (!datos.programaAcademico) {
      ctx.addIssue({ code: 'custom', path: ['programaAcademico'], message: 'Elige el programa académico' });
    }
  });

/**
 * Crear o editar un usuario. Al crear, muestra la contraseña temporal una sola vez
 * antes de cerrar: el backend no la vuelve a entregar.
 */
export default function UsuarioFormDialog({ usuario, esUnoMismo, onCerrar, onGuardado }) {
  const esEdicion = Boolean(usuario?.id);
  const [errorServidor, setErrorServidor] = useState('');
  const [creado, setCreado] = useState(null);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      nombres: usuario?.nombres ?? '',
      apellidos: usuario?.apellidos ?? '',
      correo: usuario?.correo ?? '',
      rol: usuario?.rol ?? ROLES.DOCENTE,
      programaAcademico: usuario?.programaAcademico ?? '',
    },
  });
  const esEstudiante = useWatch({ control, name: 'rol' }) === ROLES.ESTUDIANTE;

  const enviar = async (datos) => {
    setErrorServidor('');
    const cuerpo = {
      nombres: datos.nombres.trim(),
      apellidos: datos.apellidos.trim(),
      rol: datos.rol,
      programaAcademico: datos.rol === ROLES.ESTUDIANTE ? datos.programaAcademico : null,
    };
    try {
      if (esEdicion) {
        await actualizar(usuario.id, cuerpo);
        onGuardado();
      } else {
        setCreado(await crear({ ...cuerpo, correo: datos.correo.trim() }));
      }
    } catch (error) {
      setErrorServidor(mensajeDeError(error, 'No pudimos guardar el usuario.'));
    }
  };

  if (creado) {
    return (
      <Dialog open onClose={onGuardado} fullWidth maxWidth="sm" aria-labelledby="titulo-usuario-creado">
        <DialogTitle id="titulo-usuario-creado">Usuario creado</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography>
              Entrégale a <strong>{creado.usuario.correo}</strong> esta contraseña temporal para su primer ingreso:
            </Typography>
            <Typography
              component="p"
              sx={{ fontFamily: 'monospace', fontSize: '1.4rem', letterSpacing: '0.08em', userSelect: 'all' }}
            >
              {creado.passwordTemporal}
            </Typography>
            <Alert severity="warning">Cópiala ahora: no se volverá a mostrar.</Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={onGuardado}>
            Listo
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open onClose={onCerrar} fullWidth maxWidth="sm" aria-labelledby="titulo-usuario">
      <form onSubmit={handleSubmit(enviar)} noValidate>
        <DialogTitle id="titulo-usuario">{esEdicion ? 'Editar usuario' : 'Crear usuario'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {errorServidor && <Alert severity="error">{errorServidor}</Alert>}
            <TextField
              label="Nombres"
              {...register('nombres')}
              error={Boolean(errors.nombres)}
              helperText={errors.nombres?.message}
            />
            <TextField
              label="Apellidos"
              {...register('apellidos')}
              error={Boolean(errors.apellidos)}
              helperText={errors.apellidos?.message}
            />
            <TextField
              label="Correo"
              type="email"
              {...register('correo')}
              disabled={esEdicion}
              error={Boolean(errors.correo)}
              helperText={esEdicion ? 'El correo identifica la cuenta y no se cambia.' : errors.correo?.message}
            />
            <Controller
              name="rol"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Rol"
                  disabled={esUnoMismo}
                  helperText={esUnoMismo ? 'No puedes quitarte el rol de administrador.' : undefined}
                >
                  {Object.values(ROLES).map((rol) => (
                    <MenuItem key={rol} value={rol}>
                      {ETIQUETA_ROL[rol]}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            {esEstudiante && (
              <Controller
                name="programaAcademico"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Programa académico"
                    error={Boolean(errors.programaAcademico)}
                    helperText={errors.programaAcademico?.message}
                  >
                    {PROGRAMAS_ACADEMICOS.map((programa) => (
                      <MenuItem key={programa} value={programa}>
                        {programa}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCerrar} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : 'Guardar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
