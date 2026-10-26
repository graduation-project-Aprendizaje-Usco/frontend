/**
 * Aplicación de la prueba (SCRUM-137, 138 y 139). Referencia visual: prototipos 07 y 08.
 *  - Temporizador sincronizado con el servidor (segundosRestantes al cargar); aviso a los 5 min; en 0 finaliza.
 *  - Progreso x/total, Anterior/Siguiente y mapa de ítems; se retoma en el primer ítem sin responder.
 *  - Cada respuesta se guarda al elegirla; si falla, se puede reintentar.
 *  - Finalizar pide confirmación y avisa cuántos ítems quedan sin responder.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { finalizar, responder } from '../../api/diagnosticoApi';
import { mensajeDeError } from '../../api/errores';
import ItemDiagnostico from './ItemDiagnostico';

const AVISO_SEGUNDOS = 5 * 60;

/** Segundos que faltan, contados con el reloj local a partir del valor que dio el servidor. */
function useSegundosRestantes(inicial) {
  const [fin] = useState(() => Date.now() + inicial * 1000);
  const [restantes, setRestantes] = useState(inicial);
  useEffect(() => {
    const intervalo = setInterval(
      () => setRestantes(Math.max(0, Math.round((fin - Date.now()) / 1000))),
      1000,
    );
    return () => clearInterval(intervalo);
  }, [fin]);
  return restantes;
}

const formatear = (segundos) =>
  `${String(Math.floor(segundos / 60)).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`;

export default function PruebaDiagnostico({ intento, onFinalizada }) {
  const { items } = intento;
  const [respuestas, setRespuestas] = useState(
    () => new Map(intento.respuestas.map(({ itemId, opcionId }) => [itemId, opcionId])),
  );
  const [estados, setEstados] = useState({});
  const [indice, setIndice] = useState(() => {
    const primeroSinResponder = items.findIndex((item) => !respuestas.has(item.id));
    return primeroSinResponder === -1 ? 0 : primeroSinResponder;
  });
  const [avisoSinRespuesta, setAvisoSinRespuesta] = useState(null); // id del ítem con el aviso
  const [confirmando, setConfirmando] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [errorFinalizar, setErrorFinalizar] = useState('');
  const restantes = useSegundosRestantes(intento.segundosRestantes);
  const tituloRef = useRef(null);
  const primeraVez = useRef(true);

  const entregar = useCallback(async () => {
    setFinalizando(true);
    setErrorFinalizar('');
    try {
      onFinalizada(await finalizar(intento.id));
    } catch (error) {
      setErrorFinalizar(mensajeDeError(error, 'No pudimos entregar la prueba. Intenta de nuevo.'));
      setFinalizando(false);
    }
  }, [intento.id, onFinalizada]);

  // Se acabó el tiempo: se entrega sola (una vez).
  const entregadaPorTiempo = useRef(false);
  useEffect(() => {
    if (restantes === 0 && !entregadaPorTiempo.current) {
      entregadaPorTiempo.current = true;
      entregar();
    }
  }, [restantes, entregar]);

  // Al cambiar de ítem, el foco va al título para que teclado y lector de pantalla empiecen ahí.
  useEffect(() => {
    if (primeraVez.current) {
      primeraVez.current = false;
      return;
    }
    tituloRef.current?.focus();
  }, [indice]);

  const guardar = async (itemId, opcionId) => {
    setRespuestas((anteriores) => new Map(anteriores).set(itemId, opcionId));
    setEstados((anteriores) => ({ ...anteriores, [itemId]: 'guardando' }));
    try {
      await responder(intento.id, itemId, opcionId);
      setEstados((anteriores) => ({ ...anteriores, [itemId]: 'guardado' }));
    } catch (error) {
      // 409 (ya finalizado) o 422 (se acabó el tiempo): el intento terminó en el servidor.
      if ([409, 422].includes(error?.response?.status)) {
        entregar();
        return;
      }
      setEstados((anteriores) => ({ ...anteriores, [itemId]: 'error' }));
    }
  };

  const item = items[indice];
  const respondidas = respuestas.size;
  const sinResponder = items.length - respondidas;
  const entregandoPorTiempo = restantes === 0 && finalizando;
  // PV-01 (prototipo 08): "Siguiente" sin responder avisa y ofrece "Saltar ítem"; se quita al responder o al moverse.
  const conAviso = avisoSinRespuesta === item.id && !respuestas.has(item.id);
  const irA = (i) => {
    setAvisoSinRespuesta(null);
    setIndice(i);
  };

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 820 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
      >
        <Typography
          ref={tituloRef}
          tabIndex={-1}
          variant="h5"
          component="h1"
          sx={{ outline: 'none' }}
        >
          Prueba diagnóstica
        </Typography>
        <Typography
          role="timer"
          aria-label={`Tiempo restante ${formatear(restantes)}`}
          sx={{
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            color: restantes <= AVISO_SEGUNDOS ? 'warning.main' : 'text.primary',
          }}
        >
          Tiempo restante {formatear(restantes)}
        </Typography>
      </Stack>

      {restantes <= AVISO_SEGUNDOS && restantes > 0 && (
        <Alert severity="warning">
          Quedan menos de 5 minutos. Al llegar a 0 la prueba se entrega sola.
        </Alert>
      )}

      <Box>
        <Typography
          variant="body2"
          color="text.secondary"
          id="progreso-diagnostico"
          sx={{ mb: 0.5 }}
        >
          {respondidas} de {items.length} respondidas
        </Typography>
        <LinearProgress
          variant="determinate"
          value={(respondidas / items.length) * 100}
          aria-labelledby="progreso-diagnostico"
          aria-valuetext={`${respondidas} de ${items.length} respondidas`}
        />
      </Box>

      <Paper
        variant="outlined"
        sx={{ p: { xs: 2, sm: 3 }, ...(conAviso && { borderColor: 'error.main', borderWidth: 2 }) }}
      >
        {conAviso && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => irA(indice + 1)}>
                Saltar ítem
              </Button>
            }
          >
            Selecciona una opción para continuar. Si prefieres dejarlo para el final, usa «Saltar
            ítem»: quedará sin responder en el mapa.
          </Alert>
        )}
        <ItemDiagnostico
          key={item.id}
          item={item}
          numero={indice + 1}
          total={items.length}
          opcionId={respuestas.get(item.id)}
          estado={estados[item.id]}
          onResponder={(opcionId) => guardar(item.id, opcionId)}
          onReintentar={() => guardar(item.id, respuestas.get(item.id))}
        />
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', mt: 2 }}>
          <Button variant="outlined" onClick={() => irA(indice - 1)} disabled={indice === 0}>
            Anterior
          </Button>
          {indice < items.length - 1 ? (
            <Button
              variant="contained"
              onClick={() =>
                respuestas.has(item.id) ? irA(indice + 1) : setAvisoSinRespuesta(item.id)
              }
            >
              Siguiente
            </Button>
          ) : (
            <Button variant="contained" onClick={() => setConfirmando(true)}>
              Finalizar la prueba
            </Button>
          )}
        </Stack>
      </Paper>

      <Box component="nav" aria-label="Mapa de ítems">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Ir a un ítem (los respondidos están rellenos)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {items.map((it, i) => {
            const respondido = respuestas.has(it.id);
            return (
              <Button
                key={it.id}
                size="small"
                variant={respondido ? 'contained' : 'outlined'}
                aria-current={i === indice ? 'step' : undefined}
                aria-label={`Ítem ${i + 1}, ${respondido ? 'respondido' : 'sin responder'}`}
                onClick={() => irA(i)}
                sx={{
                  minWidth: 44,
                  minHeight: 44,
                  p: 0,
                  ...(i === indice && {
                    outline: 2,
                    outlineColor: 'primary.dark',
                    outlineOffset: 2,
                  }),
                }}
              >
                {i + 1}
              </Button>
            );
          })}
        </Box>
      </Box>

      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Tus respuestas se guardan automáticamente.
        </Typography>
        {indice < items.length - 1 && (
          <Button onClick={() => setConfirmando(true)}>Finalizar la prueba</Button>
        )}
      </Stack>

      {errorFinalizar && <Alert severity="error">{errorFinalizar}</Alert>}

      <Dialog
        open={confirmando || finalizando}
        onClose={() => !finalizando && setConfirmando(false)}
        aria-labelledby="titulo-finalizar"
      >
        <DialogTitle id="titulo-finalizar">
          {entregandoPorTiempo ? 'Se acabó el tiempo' : '¿Entregar la prueba?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {entregandoPorTiempo
              ? 'Estamos entregando tus respuestas…'
              : sinResponder > 0
                ? `Te ${sinResponder === 1 ? 'falta 1 ítem' : `faltan ${sinResponder} ítems`} sin responder; cuentan como incorrectos. Después de entregar no podrás cambiar tus respuestas.`
                : 'Respondiste todos los ítems. Después de entregar no podrás cambiar tus respuestas.'}
          </DialogContentText>
        </DialogContent>
        {!entregandoPorTiempo && (
          <DialogActions>
            <Button autoFocus onClick={() => setConfirmando(false)} disabled={finalizando}>
              Seguir respondiendo
            </Button>
            <Button variant="contained" onClick={entregar} loading={finalizando}>
              Sí, entregar
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </Stack>
  );
}
