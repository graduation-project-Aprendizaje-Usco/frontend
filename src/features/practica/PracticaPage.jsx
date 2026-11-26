import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  FormControlLabel,
  FormLabel,
  LinearProgress,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowForwardOutlined from '@mui/icons-material/ArrowForwardOutlined';
import CheckCircleOutlineOutlined from '@mui/icons-material/CheckCircleOutlineOutlined';
import LightbulbOutlined from '@mui/icons-material/LightbulbOutlined';
import ReplayOutlined from '@mui/icons-material/ReplayOutlined';
import { Link } from 'react-router';
import { responder, siguiente } from '../../api/practicaApi';
import { mensajeDeError } from '../../api/errores';
import MathText from '../../components/MathText';
import PanelRetroalimentacion from './PanelRetroalimentacion';

const ASIGNATURA = 'CALCULO_DIFERENCIAL';
const NOMBRE_NIVEL = { 1: 'Básico', 2: 'Intermedio', 3: 'Avanzado' };
const COLOR_DIMENSION = {
  ALGEBRAICA: 'dimension.algebraica',
  LOGICA: 'dimension.logica',
  FUNCIONAL: 'dimension.funcional',
};

function esNumericaValida(valor) {
  return /^[+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)$/.test(valor.trim());
}

function nivelActual(nivel) {
  return NOMBRE_NIVEL[nivel] ?? `Nivel ${nivel}`;
}

function TarjetaIndicador({ etiqueta, valor, detalle }) {
  return (
    <Card sx={{ flex: 1, minWidth: { xs: 'calc(50% - 8px)', sm: 0 } }}>
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        <Typography variant="caption" color="text.secondary">
          {etiqueta}
        </Typography>
        <Typography variant="h5" component="p" sx={{ mt: 0.5, fontWeight: 700 }}>
          {valor}
        </Typography>
        {detalle && (
          <Typography variant="caption" color="text.secondary">
            {detalle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function PracticaPage() {
  const [ejercicio, setEjercicio] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [cargandoSiguiente, setCargandoSiguiente] = useState(false);
  const [errorCarga, setErrorCarga] = useState('');
  const [sinEjercicios, setSinEjercicios] = useState(false);
  const [opcionId, setOpcionId] = useState('');
  const [respuestaNumerica, setRespuestaNumerica] = useState('');
  const [resultado, setResultado] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');
  const [pistaMostrada, setPistaMostrada] = useState(false);
  const [ejerciciosResueltos, setEjerciciosResueltos] = useState(() => new Set());
  const [rachaSesion, setRachaSesion] = useState(0);
  const [niveles, setNiveles] = useState({});

  const secuenciaCarga = useRef(0);
  const bloqueoEnvio = useRef(false);
  const solicitudPendiente = useRef(null);
  const inicioIntento = useRef(0);
  const tituloRef = useRef(null);

  const solicitarSiguiente = useCallback(async () => {
    const secuencia = ++secuenciaCarga.current;
    try {
      const siguienteEjercicio = await siguiente(ASIGNATURA);
      if (secuencia !== secuenciaCarga.current) return;
      setEjercicio(siguienteEjercicio);
      inicioIntento.current = Date.now();
      if (siguienteEjercicio.competencia?.codigo) {
        setNiveles((anteriores) => ({
          ...anteriores,
          [siguienteEjercicio.competencia.codigo]: {
            codigo: siguienteEjercicio.competencia.codigo,
            nombre: siguienteEjercicio.competencia.nombre,
            rachaAciertos:
              anteriores[siguienteEjercicio.competencia.codigo]?.rachaAciertos ?? 0,
          },
        }));
      }
    } catch (error) {
      if (secuencia !== secuenciaCarga.current) return;
      if (error?.response?.status === 404) {
        setSinEjercicios(true);
      } else {
        setErrorCarga(mensajeDeError(error, 'No pudimos cargar el siguiente ejercicio.'));
      }
    } finally {
      if (secuencia === secuenciaCarga.current) {
        setCargando(false);
        setCargandoSiguiente(false);
      }
    }
  }, []);

  const cargarSiguiente = useCallback(() => {
    setCargando(true);
    setCargandoSiguiente(Boolean(ejercicio));
    setErrorCarga('');
    setErrorEnvio('');
    setSinEjercicios(false);
    setEjercicio(null);
    setResultado(null);
    setOpcionId('');
    setRespuestaNumerica('');
    setPistaMostrada(false);
    solicitudPendiente.current = null;
    solicitarSiguiente();
  }, [ejercicio, solicitarSiguiente]);

  useEffect(() => {
    document.title = 'Práctica · Aprendizaje USCO';
    // solicitarSiguiente actualiza el estado solo después de recibir la respuesta HTTP.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    solicitarSiguiente();
    return () => {
      secuenciaCarga.current += 1;
    };
  }, [solicitarSiguiente]);

  useEffect(() => {
    if (ejercicio) tituloRef.current?.focus();
  }, [ejercicio]);

  const validarRespuesta = () => {
    if (!ejercicio) return false;
    if (ejercicio.tipo === 'NUMERICA') return esNumericaValida(respuestaNumerica);
    return opcionId !== '';
  };

  const enviarRespuesta = async () => {
    if (!ejercicio || resultado || bloqueoEnvio.current || !validarRespuesta()) return;

    if (!solicitudPendiente.current) {
      const tiempoSeg = Math.min(86400, Math.max(0, Math.floor((Date.now() - inicioIntento.current) / 1000)));
      solicitudPendiente.current = {
        ejercicioId: ejercicio.id,
        opcionId: ejercicio.tipo === 'OPCION_MULTIPLE' ? Number(opcionId) : null,
        respuestaNumerica:
          ejercicio.tipo === 'NUMERICA' ? Number(respuestaNumerica.trim().replace(',', '.')) : null,
        tiempoSeg,
        pistaUsada: pistaMostrada,
        claveIdempotencia: globalThis.crypto.randomUUID(),
      };
    }

    bloqueoEnvio.current = true;
    setEnviando(true);
    setErrorEnvio('');
    try {
      const confirmado = await responder(solicitudPendiente.current);
      setResultado(confirmado);
      solicitudPendiente.current = null;
      setEjerciciosResueltos((anteriores) => new Set(anteriores).add(ejercicio.id));
      setRachaSesion((racha) => (confirmado.esCorrecta ? racha + 1 : 0));
      if (confirmado.nivel?.competenciaCodigo) {
        setNiveles((anteriores) => ({
          ...anteriores,
          [confirmado.nivel.competenciaCodigo]: {
            ...anteriores[confirmado.nivel.competenciaCodigo],
            codigo: confirmado.nivel.competenciaCodigo,
            nivel: confirmado.nivel.nivel,
            rachaAciertos: confirmado.nivel.rachaAciertos,
          },
        }));
      }
    } catch (error) {
      setErrorEnvio(mensajeDeError(error, 'No pudimos registrar tu respuesta. Intenta de nuevo.'));
    } finally {
      bloqueoEnvio.current = false;
      setEnviando(false);
    }
  };

  const intentarDeNuevo = () => {
    setResultado(null);
    setOpcionId('');
    setRespuestaNumerica('');
    setErrorEnvio('');
    solicitudPendiente.current = null;
    inicioIntento.current = Date.now();
    tituloRef.current?.focus();
  };

  const hayRespuesta = validarRespuesta();
  const resultadoCorrecto = resultado?.esCorrecta === true;
  const puedeReintentar = resultado?.puedeReintentar === true;
  const dimensiones = Object.values(niveles);

  return (
    <Stack spacing={2.5} sx={{ maxWidth: 980, mx: 'auto' }}>
      <Box>
        <Typography variant="h4" component="h1">
          Práctica adaptativa
        </Typography>
        <Typography color="text.secondary">
          Resuelve ejercicios de Cálculo Diferencial y recibe retroalimentación.
        </Typography>
      </Box>

      <Stack
        direction="row"
        spacing={1.5}
        useFlexGap
        aria-label="Indicadores de sesión"
        sx={{ flexWrap: 'wrap' }}
      >
        <TarjetaIndicador
          etiqueta="Racha de aciertos"
          valor={rachaSesion}
          detalle="Consecutivos en esta sesión"
        />
        <TarjetaIndicador
          etiqueta="Ejercicios resueltos"
          valor={ejerciciosResueltos.size}
          detalle="Ejercicios distintos confirmados"
        />
        <Card sx={{ flex: 1, minWidth: { xs: '100%', sm: 240 } }}>
          <CardContent sx={{ '&:last-child': { pb: 2 } }}>
            <Typography variant="caption" color="text.secondary">
              Nivel actual por dimensión
            </Typography>
            {dimensiones.length === 0 ? (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Se mostrará al cargar un ejercicio.
              </Typography>
            ) : (
              <Stack spacing={0.5} sx={{ mt: 1 }}>
                {dimensiones.map((dimension) => (
                  <Typography key={dimension.codigo} variant="body2">
                    {dimension.nombre ?? dimension.codigo}:{' '}
                    <strong>
                      {dimension.nivel == null ? 'Sin intento confirmado' : nivelActual(dimension.nivel)}
                    </strong>
                  </Typography>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>

      {errorCarga && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={cargarSiguiente}>
              Reintentar
            </Button>
          }
        >
          {errorCarga}
        </Alert>
      )}

      {cargando && (
        <Box role="status" aria-live="polite">
          <Typography sx={{ mb: 1 }}>{cargandoSiguiente ? 'Cargando siguiente ejercicio…' : 'Cargando ejercicio…'}</Typography>
          <LinearProgress />
        </Box>
      )}

      {sinEjercicios && !cargando && (
        <Alert
          severity="info"
          action={
            <Button component={Link} to="/estudiante" color="inherit" size="small">
              Volver al inicio
            </Button>
          }
        >
          No hay ejercicios disponibles para practicar en este momento.
        </Alert>
      )}

      {ejercicio && !cargando && (
        <>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Box
                aria-hidden="true"
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: 0.5,
                  bgcolor: COLOR_DIMENSION[ejercicio.competencia?.codigo] ?? 'primary.main',
                }}
              />
              <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.04em' }}>
                {ejercicio.competencia?.nombre ?? ejercicio.competencia?.codigo}
              </Typography>
              <Chip size="small" label={nivelActual(ejercicio.nivel)} color="primary" variant="outlined" />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {resultado ? `Intento ${resultado.numeroIntento} · confirmado` : 'Ejercicio en curso'}
            </Typography>
          </Stack>

          <Card>
            <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
              <Typography
                ref={tituloRef}
                tabIndex={-1}
                variant="h6"
                component="h2"
                sx={{ mb: 2, outline: 'none' }}
              >
                <MathText texto={ejercicio.enunciado} />
              </Typography>

              {ejercicio.tipo === 'OPCION_MULTIPLE' && (
                <FormControl component="fieldset" fullWidth disabled={Boolean(resultado) || enviando || Boolean(errorEnvio)}>
                  <FormLabel component="legend" sx={{ mb: 1 }}>
                    Elige una respuesta
                  </FormLabel>
                  <RadioGroup
                    aria-label="Opciones de respuesta"
                    name={`ejercicio-${ejercicio.id}`}
                    value={opcionId}
                    onChange={(evento) => setOpcionId(evento.target.value)}
                  >
                    <Stack spacing={1}>
                      {ejercicio.opciones.map((opcion) => {
                        const seleccionada = String(opcion.id) === opcionId;
                        const estiloResultado =
                          resultado && seleccionada
                            ? resultadoCorrecto
                              ? { borderColor: 'success.main', bgcolor: 'success.light' }
                              : { borderColor: 'error.main', bgcolor: 'error.light' }
                            : {};
                        return (
                          <FormControlLabel
                            key={opcion.id}
                            value={String(opcion.id)}
                            control={<Radio />}
                            label={
                              <MathText
                                texto={`${opcion.letra}) ${opcion.texto}`}
                                sx={{ width: '100%', overflowWrap: 'anywhere' }}
                              />
                            }
                            sx={{
                              m: 0,
                              px: 1.5,
                              py: 0.75,
                              border: 1,
                              borderColor: seleccionada ? 'primary.main' : 'divider',
                              borderRadius: 1,
                              bgcolor: seleccionada && !resultado ? 'usco.vino.50' : 'background.paper',
                              '&:hover': { borderColor: 'primary.main' },
                              ...estiloResultado,
                            }}
                          />
                        );
                      })}
                    </Stack>
                  </RadioGroup>
                </FormControl>
              )}

              {ejercicio.tipo === 'NUMERICA' && (
                <TextField
                  fullWidth
                  type="text"
                  label="Respuesta numérica"
                  value={respuestaNumerica}
                  onChange={(evento) => setRespuestaNumerica(evento.target.value)}
                  disabled={Boolean(resultado) || enviando || Boolean(errorEnvio)}
                  slotProps={{
                    htmlInput: { inputMode: 'decimal', 'aria-describedby': 'ayuda-respuesta-numerica' },
                  }}
                  helperText={
                    <span id="ayuda-respuesta-numerica">
                      Escribe un número; puedes usar coma o punto decimal.
                    </span>
                  }
                  error={respuestaNumerica !== '' && !esNumericaValida(respuestaNumerica)}
                />
              )}

              {errorEnvio && (
                <Alert severity="error" sx={{ mt: 2 }} role="alert">
                  {errorEnvio}
                </Alert>
              )}

              <PanelRetroalimentacion resultado={resultado} />

              {pistaMostrada && ejercicio.pista && !resultado && (
                <Alert severity="info" icon={<LightbulbOutlined />} sx={{ mt: 2 }}>
                  <MathText texto={ejercicio.pista} component="div" />
                </Alert>
              )}
            </CardContent>
          </Card>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
          >
            <Button component={Link} to="/estudiante" color="primary" variant="text">
              Salir de la práctica
            </Button>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              {!resultado && ejercicio.pista && (
                <Button
                  variant="outlined"
                  startIcon={<LightbulbOutlined />}
                  onClick={() => setPistaMostrada(true)}
                  disabled={pistaMostrada || enviando || Boolean(errorEnvio)}
                >
                  {pistaMostrada ? 'Pista mostrada' : 'Ver pista'}
                </Button>
              )}
              {!resultado && (
                <Button
                  variant="contained"
                  onClick={enviarRespuesta}
                  disabled={!hayRespuesta || enviando}
                  startIcon={enviando ? undefined : <CheckCircleOutlineOutlined />}
                >
                  {enviando ? 'Enviando…' : errorEnvio ? 'Reintentar envío' : 'Comprobar respuesta'}
                </Button>
              )}
              {resultado && puedeReintentar && (
                <Button
                  variant="outlined"
                  startIcon={<ReplayOutlined />}
                  onClick={intentarDeNuevo}
                >
                  Intentar de nuevo
                </Button>
              )}
              {resultado && (resultadoCorrecto || !puedeReintentar) && (
                <Button
                  variant="contained"
                  endIcon={<ArrowForwardOutlined />}
                  onClick={cargarSiguiente}
                  disabled={cargando}
                >
                  Siguiente ejercicio
                </Button>
              )}
            </Stack>
          </Stack>
        </>
      )}
    </Stack>
  );
}
