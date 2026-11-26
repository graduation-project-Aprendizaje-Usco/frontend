/**
 * Instrucciones de la prueba diagnóstica (SCRUM-135). Referencia visual: prototipo 06.
 * Con un intento EN_CURSO el botón dice "Continuar la prueba" y no pide de nuevo la autorización.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Box, Button, Checkbox, FormControlLabel, Paper, Stack, Typography } from '@mui/material';

// shortcut: valores del instrumento v2.0 (README-backend §12); si cambia la prueba, tomarlos del intento.
const DATOS = [
  { etiqueta: 'Ítems', valor: '24' },
  { etiqueta: 'Tiempo', valor: '36 min' },
  { etiqueta: 'Dimensiones', valor: 'Algebraica · Razonamiento lógico · Comprensión funcional' },
];

export default function InstruccionesDiagnostico({ enCurso, cargando, onComenzar }) {
  const navigate = useNavigate();
  const [autoriza, setAutoriza] = useState(false);

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 4 }, maxWidth: 760 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Prueba diagnóstica de competencias matemáticas
          </Typography>
          <Typography color="text.secondary">
            {enCurso ? 'Ya empezaste la prueba: puedes continuar donde ibas.' : 'Antes de empezar, lee estas condiciones.'}
          </Typography>
        </Box>

        <Box component="dl" sx={{ display: 'grid', gridTemplateColumns: { sm: 'auto auto 1fr' }, gap: 2, m: 0 }}>
          {DATOS.map(({ etiqueta, valor }) => (
            <Box key={etiqueta}>
              <Typography component="dt" variant="body2" color="text.secondary">
                {etiqueta}
              </Typography>
              <Typography component="dd" sx={{ m: 0, fontWeight: 600 }}>
                {valor}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box component="ul" sx={{ m: 0, pl: 3, '& li': { mb: 1 } }}>
          <li>Puedes avanzar y retroceder entre ítems; cada respuesta se guarda automáticamente.</li>
          <li>No hay penalización por responder mal: la prueba define tu punto de partida, no una nota.</li>
          <li>Si cierras la ventana, retomas donde ibas. El tiempo sigue corriendo.</li>
          <li>La prueba se presenta una sola vez.</li>
        </Box>

        {!enCurso && (
          <Box>
            <Typography sx={{ fontWeight: 600 }}>Tratamiento de datos</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Tus respuestas se usan para armar tu ruta de práctica y para reportes agregados del curso. El docente ve
              tus resultados; los reportes institucionales usan un código, no tu nombre.
            </Typography>
            <FormControlLabel
              control={<Checkbox checked={autoriza} onChange={(evento) => setAutoriza(evento.target.checked)} />}
              label="Autorizo el tratamiento de mis datos para los fines descritos (Ley 1581 de 2012)."
            />
          </Box>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button variant="contained" size="large" onClick={onComenzar} disabled={!enCurso && !autoriza} loading={cargando}>
            {enCurso ? 'Continuar la prueba' : 'Comenzar la prueba'}
          </Button>
          <Button variant="outlined" size="large" onClick={() => navigate('/estudiante')}>
            Hacerla más tarde
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
