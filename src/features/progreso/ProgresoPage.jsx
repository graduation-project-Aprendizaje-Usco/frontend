import { useCallback, useEffect, useRef, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import AssignmentTurnedInOutlined from '@mui/icons-material/AssignmentTurnedInOutlined';
import PlayArrowOutlined from '@mui/icons-material/PlayArrowOutlined';
import { useNavigate } from 'react-router';
import CargandoPagina from '../../components/CargandoPagina';
import { obtenerMiProgreso } from '../../api/progresoApi';
import { mensajeDeError } from '../../api/errores';
import ResumenKpis from './components/ResumenKpis';
import AvisoEvaluacionParcial from './components/AvisoEvaluacionParcial';
import GraficaDimensiones from './components/GraficaDimensiones';
import GraficaTendenciaSemanal from './components/GraficaTendenciaSemanal';
import EstadoSinActividad from './components/EstadoSinActividad';
import HistorialResultados from '../../components/HistorialResultados';

export default function ProgresoPage() {
  const [progreso, setProgreso] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Bandera de montaje para evitar actualizaciones de estado tras desmontaje
  const montadoRef = useRef(true);

  useEffect(() => {
    document.title = 'Mi progreso · Aprendizaje USCO';
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
    };
  }, []);

  const cargarProgreso = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerMiProgreso();
      if (montadoRef.current) {
        setProgreso(data);
      }
    } catch (err) {
      if (montadoRef.current) {
        setError(mensajeDeError(err, 'No fue posible cargar tu información de progreso. Intenta nuevamente.'));
      }
    } finally {
      if (montadoRef.current) {
        setCargando(false);
      }
    }
  }, []);

  useEffect(() => {
    // Al montar, cargando ya es true; el resto del estado cambia después de la respuesta HTTP.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarProgreso();
  }, [cargarProgreso]);

  if (cargando) {
    return <CargandoPagina mensaje="Cargando tu progreso académico..." />;
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" startIcon={<RefreshOutlined />} onClick={cargarProgreso}>
              Reintentar
            </Button>
          }
          sx={{ borderRadius: 2 }}
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!progreso) {
    return null;
  }

  const sinIntentosPractica = (progreso.totalIntentos ?? 0) === 0;
  const tieneDiagnosticoRegistrado = (progreso.dimensiones || []).some(
    (d) => d.porcentajeDiagnostico !== null && d.porcentajeDiagnostico !== undefined,
  );

  return (
    <Stack spacing={3} sx={{ maxWidth: 1100, mx: 'auto', pb: 4 }}>
      {/* Encabezado institucional */}
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Mi progreso académico
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Consulta tu rendimiento, conoce tu nivel de dominio y observa cómo evoluciona tu aprendizaje.
        </Typography>
      </Box>

      {/* Escenario 1: Sin intentos de práctica y sin diagnóstico inicial */}
      {sinIntentosPractica && !tieneDiagnosticoRegistrado && <EstadoSinActividad />}

      {/* Escenario 2: Sin intentos de práctica pero con diagnóstico inicial registrado */}
      {sinIntentosPractica && tieneDiagnosticoRegistrado && (
        <>
          <Alert
            severity="info"
            icon={<AssignmentTurnedInOutlined />}
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<PlayArrowOutlined />}
                onClick={() => navigate('/estudiante/practica')}
              >
                Comenzar práctica
              </Button>
            }
            sx={{ borderRadius: 2 }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              Diagnóstico inicial completado
            </Typography>
            <Typography variant="body2">
              Tus resultados diagnósticos están registrados por dimensión. A medida que resuelvas ejercicios en el
              módulo de práctica, verás reflejada aquí tu evolución, porcentaje de aciertos y variación de desempeño.
            </Typography>
          </Alert>

          {/* Tarjetas KPI de resumen */}
          <ResumenKpis progreso={progreso} />

          {/* Gráfico y tabla comparativa mostrando el punto de partida diagnóstico */}
          <GraficaDimensiones dimensiones={progreso.dimensiones || []} />
        </>
      )}

      {/* Escenario 3: Con intentos de práctica registrados */}
      {!sinIntentosPractica && (
        <>
          {/* Tarjetas KPI de resumen */}
          <ResumenKpis progreso={progreso} />

          {/* Aviso informativo de evaluación parcial si aplica */}
          {progreso.evaluacionParcial && (
            <AvisoEvaluacionParcial dimensiones={progreso.dimensiones || []} />
          )}

          {/* Gráfico y tabla de rendimiento por dimensión */}
          <GraficaDimensiones dimensiones={progreso.dimensiones || []} />

          {/* Gráfico y tabla de evolución semanal */}
          <GraficaTendenciaSemanal tendencia={progreso.tendenciaSemanal || []} />
        </>
      )}

      {/* Historial de resultados (SCRUM-41): solo si hay algo que listar */}
      {!(sinIntentosPractica && !tieneDiagnosticoRegistrado) && <HistorialResultados />}
    </Stack>
  );
}
