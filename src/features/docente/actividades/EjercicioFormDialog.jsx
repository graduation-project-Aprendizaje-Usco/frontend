import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import MathText from '../../../components/MathText';
import { actualizar, crear } from '../../../api/ejerciciosApi';
import { mensajeDeError } from '../../../api/errores';
import { LETRAS, NIVELES, TIPOS } from './catalogos';

const opcionesIniciales = (ejercicio) =>
  LETRAS.map((letra, indice) => ({
    letra,
    texto: ejercicio?.opciones?.[indice]?.texto ?? '',
    correcta: ejercicio?.opciones?.[indice]?.correcta ?? false,
  }));

const esquema = z
  .object({
    contenidoId: z.string().min(1, 'Elige un contenido'),
    codigo: z.string().max(40).optional(),
    nivel: z.string().min(1, 'Elige un nivel'),
    tipo: z.enum(['OPCION_MULTIPLE', 'NUMERICA']),
    enunciado: z.string().trim().min(1, 'El enunciado es obligatorio').max(2000),
    pista: z.string().trim().min(1, 'La pista es obligatoria').max(1000),
    explicacion: z.string().trim().min(1, 'La explicación es obligatoria').max(2000),
    errorComun: z.string().max(1000).optional(),
    opciones: z.array(
      z.object({
        letra: z.string(),
        texto: z.string(),
        correcta: z.boolean(),
      }),
    ).length(4),
    respuestaNumerica: z.string().optional(),
    tolerancia: z.string().optional(),
  })
  .superRefine((datos, ctx) => {
    if (datos.tipo === 'OPCION_MULTIPLE') {
      const correctas = datos.opciones.filter((opcion) => opcion.correcta).length;
      if (correctas !== 1) {
        ctx.addIssue({
          code: 'custom',
          path: ['opciones'],
          message: 'Marca exactamente una opción como correcta',
        });
      }
      if (datos.opciones.some((opcion) => !opcion.texto.trim())) {
        ctx.addIssue({
          code: 'custom',
          path: ['opciones'],
          message: 'Completa las cuatro opciones',
        });
      }
      return;
    }
    if (!datos.respuestaNumerica?.trim() || Number.isNaN(Number(datos.respuestaNumerica))) {
      ctx.addIssue({
        code: 'custom',
        path: ['respuestaNumerica'],
        message: 'Escribe una respuesta numérica válida',
      });
    }
    const tolerancia = Number(datos.tolerancia);
    if (!datos.tolerancia?.trim() || Number.isNaN(tolerancia) || tolerancia <= 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['tolerancia'],
        message: 'La tolerancia debe ser mayor que cero',
      });
    }
  });

export default function EjercicioFormDialog({ ejercicio, contenidos, onCerrar, onGuardado }) {
  const esEdicion = Boolean(ejercicio?.id);
  const [errorServidor, setErrorServidor] = useState('');
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(esquema),
    defaultValues: {
      contenidoId: String(ejercicio?.contenidoId ?? contenidos[0]?.id ?? ''),
      codigo: ejercicio?.codigo ?? '',
      nivel: String(ejercicio?.nivel ?? 1),
      tipo: ejercicio?.tipo ?? 'OPCION_MULTIPLE',
      enunciado: ejercicio?.enunciado ?? '',
      pista: ejercicio?.pista ?? '',
      explicacion: ejercicio?.explicacion ?? '',
      errorComun: ejercicio?.errorComun ?? '',
      opciones: opcionesIniciales(ejercicio),
      respuestaNumerica: ejercicio?.respuestaNumerica == null ? '' : String(ejercicio.respuestaNumerica),
      tolerancia: ejercicio?.tolerancia == null ? '' : String(ejercicio.tolerancia),
    },
  });

  const tipo = useWatch({ control, name: 'tipo' });
  const enunciado = useWatch({ control, name: 'enunciado' });
  const opciones = useWatch({ control, name: 'opciones' }) ?? [];
  const esMultiple = tipo === 'OPCION_MULTIPLE';

  const enviar = async (datos) => {
    setErrorServidor('');
    const cuerpo = {
      contenidoId: Number(datos.contenidoId),
      codigo: datos.codigo?.trim() || null,
      nivel: Number(datos.nivel),
      tipo: datos.tipo,
      enunciado: datos.enunciado.trim(),
      opciones:
        datos.tipo === 'OPCION_MULTIPLE'
          ? datos.opciones.map((opcion) => ({
              letra: opcion.letra,
              texto: opcion.texto.trim(),
              correcta: opcion.correcta,
            }))
          : [],
      respuestaNumerica: datos.tipo === 'NUMERICA' ? Number(datos.respuestaNumerica) : null,
      tolerancia: datos.tipo === 'NUMERICA' ? Number(datos.tolerancia) : null,
      pista: datos.pista.trim(),
      explicacion: datos.explicacion.trim(),
      errorComun: datos.errorComun?.trim() || null,
    };
    try {
      if (esEdicion) await actualizar(ejercicio.id, cuerpo);
      else await crear(cuerpo);
      onGuardado();
    } catch (error) {
      setErrorServidor(mensajeDeError(error, 'No pudimos guardar el ejercicio.'));
    }
  };

  return (
    <Dialog open onClose={onCerrar} fullWidth maxWidth="md">
      <form onSubmit={handleSubmit(enviar)}>
        <DialogTitle>{esEdicion ? 'Editar ejercicio' : 'Crear ejercicio'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {errorServidor && <Alert severity="error">{errorServidor}</Alert>}
            {errors.opciones && <Alert severity="error">{errors.opciones.message}</Alert>}
            <Controller
              name="contenidoId"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Contenido"
                  disabled={esEdicion}
                  error={Boolean(errors.contenidoId)}
                  helperText={errors.contenidoId?.message}
                >
                  {contenidos.map((contenido) => (
                    <MenuItem key={contenido.id} value={String(contenido.id)}>
                      {contenido.titulo} — {contenido.asignatura}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Controller
                name="nivel"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Nivel" sx={{ flex: 1 }}>
                    {NIVELES.map((nivel) => (
                      <MenuItem key={nivel.valor} value={String(nivel.valor)}>
                        {nivel.etiqueta}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                name="tipo"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Tipo" sx={{ flex: 1 }}>
                    {TIPOS.map((opcion) => (
                      <MenuItem key={opcion.valor} value={opcion.valor}>
                        {opcion.etiqueta}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Stack>
            <TextField
              label="Código"
              {...register('codigo')}
              disabled={esEdicion}
              helperText={esEdicion ? 'El código no se puede cambiar' : 'Si lo dejas vacío, se genera automáticamente'}
              error={Boolean(errors.codigo)}
            />
            <TextField
              label="Enunciado"
              {...register('enunciado')}
              multiline
              minRows={2}
              error={Boolean(errors.enunciado)}
              helperText={errors.enunciado?.message}
            />
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
              <Typography variant="overline" color="text.secondary">
                Vista previa
              </Typography>
              <Box sx={{ mt: 1 }}>
                <MathText texto={enunciado || 'Escribe el enunciado para verlo con notación matemática'} />
              </Box>
              {esMultiple && (
                <Stack spacing={0.5} sx={{ mt: 1 }}>
                  {opciones.map((opcion) => (
                    <Typography key={opcion.letra} variant="body2">
                      <strong>{opcion.letra})</strong>{' '}
                      <MathText texto={opcion.texto || 'Opción'} />
                      {opcion.correcta && ' ✓'}
                    </Typography>
                  ))}
                </Stack>
              )}
            </Paper>

            {esMultiple ? (
              <Stack spacing={1}>
                <Typography variant="subtitle2">Opciones (marca una correcta)</Typography>
                {LETRAS.map((letra, indice) => (
                  <Stack key={letra} direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      label={`Opción ${letra}`}
                      {...register(`opciones.${indice}.texto`)}
                      sx={{ flex: 1 }}
                    />
                    <FormControlLabel
                      control={<Checkbox {...register(`opciones.${indice}.correcta`)} />}
                      label="Correcta"
                    />
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Respuesta numérica"
                  type="number"
                  inputProps={{ step: 'any' }}
                  {...register('respuestaNumerica')}
                  error={Boolean(errors.respuestaNumerica)}
                  helperText={errors.respuestaNumerica?.message}
                  sx={{ flex: 1 }}
                />
                <TextField
                  label="Tolerancia"
                  type="number"
                  inputProps={{ step: 'any', min: 0 }}
                  {...register('tolerancia')}
                  error={Boolean(errors.tolerancia)}
                  helperText={errors.tolerancia?.message}
                  sx={{ flex: 1 }}
                />
              </Stack>
            )}

            <TextField
              label="Pista"
              {...register('pista')}
              multiline
              minRows={2}
              error={Boolean(errors.pista)}
              helperText={errors.pista?.message}
            />
            <TextField
              label="Explicación"
              {...register('explicacion')}
              multiline
              minRows={2}
              error={Boolean(errors.explicacion)}
              helperText={errors.explicacion?.message}
            />
            <TextField
              label="Error común (opcional)"
              {...register('errorComun')}
              multiline
              minRows={2}
              error={Boolean(errors.errorComun)}
              helperText={errors.errorComun?.message}
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
