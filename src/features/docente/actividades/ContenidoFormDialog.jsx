import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
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
} from '@mui/material';
import { actualizar, crear } from '../../../api/contenidosApi';
import { mensajeDeError } from '../../../api/errores';
import { ASIGNATURAS, COMPETENCIAS } from './catalogos';

const esquema = z.object({
  competencia: z.string().min(1, 'Elige una competencia'),
  asignatura: z.string().min(1, 'Elige una asignatura'),
  tema: z.string().trim().min(1, 'El tema es obligatorio').max(120),
  titulo: z.string().trim().min(1, 'El título es obligatorio').max(150),
  descripcion: z.string().max(500).optional(),
});

export default function ContenidoFormDialog({ contenido, onCerrar, onGuardado }) {
  const esEdicion = Boolean(contenido?.id);
  const [errorServidor, setErrorServidor] = useState('');
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      competencia: contenido?.competenciaCodigo ?? 'ALGEBRAICA',
      asignatura: contenido?.asignatura ?? 'CALCULO_DIFERENCIAL',
      tema: contenido?.tema ?? '',
      titulo: contenido?.titulo ?? '',
      descripcion: contenido?.descripcion ?? '',
    },
  });

  const enviar = async (datos) => {
    setErrorServidor('');
    const cuerpo = {
      ...datos,
      tema: datos.tema.trim(),
      titulo: datos.titulo.trim(),
      descripcion: datos.descripcion?.trim() || null,
    };
    try {
      if (esEdicion) await actualizar(contenido.id, cuerpo);
      else await crear(cuerpo);
      onGuardado();
    } catch (error) {
      setErrorServidor(mensajeDeError(error, 'No pudimos guardar el contenido.'));
    }
  };

  return (
    <Dialog open onClose={onCerrar} fullWidth maxWidth="sm">
      <form onSubmit={handleSubmit(enviar)}>
        <DialogTitle>{esEdicion ? 'Editar contenido' : 'Crear contenido'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {errorServidor && <Alert severity="error">{errorServidor}</Alert>}
            <Controller
              name="competencia"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Competencia"
                  disabled={esEdicion}
                  error={Boolean(errors.competencia)}
                  helperText={errors.competencia?.message}
                >
                  {COMPETENCIAS.map((competencia) => (
                    <MenuItem key={competencia.valor} value={competencia.valor}>
                      {competencia.etiqueta}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="asignatura"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Asignatura"
                  disabled={esEdicion}
                  error={Boolean(errors.asignatura)}
                  helperText={errors.asignatura?.message}
                >
                  {ASIGNATURAS.map((asignatura) => (
                    <MenuItem key={asignatura.valor} value={asignatura.valor}>
                      {asignatura.etiqueta}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <TextField
              label="Tema"
              {...register('tema')}
              error={Boolean(errors.tema)}
              helperText={errors.tema?.message}
            />
            <TextField
              label="Título"
              {...register('titulo')}
              error={Boolean(errors.titulo)}
              helperText={errors.titulo?.message}
            />
            <TextField
              label="Descripción"
              {...register('descripcion')}
              multiline
              minRows={2}
              error={Boolean(errors.descripcion)}
              helperText={errors.descripcion?.message}
            />
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
