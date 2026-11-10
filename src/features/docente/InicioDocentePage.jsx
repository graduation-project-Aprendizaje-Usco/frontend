import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import PersonAddOutlined from '@mui/icons-material/PersonAddOutlined';
import { useSearchParams } from 'react-router';
import CargandoPagina from '../../components/CargandoPagina';
import { listar } from '../../api/gruposApi';
import { obtenerResumenGrupo } from '../../api/analiticaApi';
import { mensajeDeError } from '../../api/errores';
import SelectorGrupo from './components/SelectorGrupo';
import FiltrosGrupo from './components/FiltrosGrupo';
import ResumenKpisGrupo from './components/ResumenKpisGrupo';
import GraficaDimensionesGrupo from './components/GraficaDimensionesGrupo';
import GraficaCategorias from './components/GraficaCategorias';
import DimensionMasDebil from './components/DimensionMasDebil';
import GraficaEvolucionGeneral from './components/GraficaEvolucionGeneral';
import TablaEjerciciosErrores from './components/TablaEjerciciosErrores';
import TablaEstudiantes from './components/TablaEstudiantes';
import CrearGrupoDialog from './components/CrearGrupoDialog';
import InscribirEstudianteDialog from './components/InscribirEstudianteDialog';
import DetalleEstudianteDrawer from './components/DetalleEstudianteDrawer';

const FILTROS_INICIALES = {
  competencia: '',
  desde: '',
  hasta: '',
};

export default function InicioDocentePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const grupoInicial = useRef(searchParams.get('grupo'));
  const cargaGruposHecha = useRef(false);

  const [grupos, setGrupos] = useState([]);
  const [cargandoGrupos, setCargandoGrupos] = useState(true);
  const [errorGrupos, setErrorGrupos] = useState('');
  const [grupoId, setGrupoId] = useState(null);

  const [filtros, setFiltros] = useState(() => ({
    competencia: searchParams.get('competencia') ?? FILTROS_INICIALES.competencia,
    desde: searchParams.get('desde') ?? FILTROS_INICIALES.desde,
    hasta: searchParams.get('hasta') ?? FILTROS_INICIALES.hasta,
  }));

  const [resumen, setResumen] = useState(null);
  const [cargandoResumen, setCargandoResumen] = useState(false);
  const [errorResumen, setErrorResumen] = useState('');
  const [refrescar, setRefrescar] = useState(0);

  const [crearAbierto, setCrearAbierto] = useState(false);
  const [inscribirAbierto, setInscribirAbierto] = useState(false);
  const [estudianteId, setEstudianteId] = useState(() => {
    const valor = Number(searchParams.get('estudiante'));
    return Number.isFinite(valor) && valor > 0 ? valor : null;
  });

  const actualizarUrl = useCallback(
    (cambios) => {
      setSearchParams(
        (anteriores) => {
          const siguientes = new URLSearchParams(anteriores);
          Object.entries(cambios).forEach(([clave, valor]) => {
            if (valor === '' || valor == null) siguientes.delete(clave);
            else siguientes.set(clave, String(valor));
          });
          return siguientes;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const cargarGrupos = useCallback(async () => {
    setCargandoGrupos(true);
    setErrorGrupos('');
    try {
      const lista = await listar();
      setGrupos(lista);
      const preferido = Number(grupoInicial.current);
      const elegido = lista.find((grupo) => grupo.id === preferido) ?? lista[0] ?? null;
      setGrupoId(elegido?.id ?? null);
      actualizarUrl({ grupo: elegido?.id ?? null });
    } catch (error) {
      setErrorGrupos(mensajeDeError(error, 'No pudimos cargar tus grupos.'));
    } finally {
      setCargandoGrupos(false);
    }
  }, [actualizarUrl]);

  useEffect(() => {
    document.title = 'Panel del docente · Aprendizaje USCO';
    if (cargaGruposHecha.current) return;
    cargaGruposHecha.current = true;
    // cargarGrupos cambia el estado solo después de la respuesta HTTP.
    cargarGrupos();
  }, [cargarGrupos]);

  useEffect(() => {
    if (!grupoId) {
      return undefined;
    }
    let cancelado = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCargandoResumen(true);
    setErrorResumen('');
    obtenerResumenGrupo(grupoId, filtros)
      .then((respuesta) => {
        if (!cancelado) setResumen(respuesta);
      })
      .catch((error) => {
        if (!cancelado) setErrorResumen(mensajeDeError(error, 'No pudimos cargar los indicadores del grupo.'));
      })
      .finally(() => {
        if (!cancelado) setCargandoResumen(false);
      });
    return () => {
      cancelado = true;
    };
  }, [grupoId, filtros, refrescar]);

  const cambiarGrupo = (id) => {
    const numero = Number(id);
    setGrupoId(numero);
    setResumen(null);
    setEstudianteId(null);
    actualizarUrl({ grupo: numero, estudiante: null });
  };

  const cambiarFiltro = (campo, valor) => {
    setFiltros((anteriores) => ({ ...anteriores, [campo]: valor }));
    actualizarUrl({ [campo]: valor });
  };

  const limpiarFiltros = () => {
    setFiltros(FILTROS_INICIALES);
    actualizarUrl({ competencia: null, desde: null, hasta: null });
  };

  const grupo = grupos.find((item) => item.id === grupoId) ?? null;
  const estudiantesEnRiesgo = (resumen?.estudiantes ?? []).filter((estudiante) => estudiante.enRiesgo);

  const abrirDetalle = (estudiante) => {
    setEstudianteId(estudiante.id);
    actualizarUrl({ estudiante: estudiante.id });
  };

  const cerrarDetalle = () => {
    setEstudianteId(null);
    actualizarUrl({ estudiante: null });
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 1250, mx: 'auto', pb: 4 }}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Desempeño de mis grupos
        </Typography>
        <Typography color="text.secondary">
          Consulta los indicadores del grupo, identifica estudiantes en riesgo y revisa su historial.
        </Typography>
      </Box>

      {cargandoGrupos && <CargandoPagina mensaje="Cargando tus grupos..." />}

      {!cargandoGrupos && errorGrupos && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" startIcon={<RefreshOutlined />} onClick={cargarGrupos}>
              Reintentar
            </Button>
          }
        >
          {errorGrupos}
        </Alert>
      )}

      {!cargandoGrupos && !errorGrupos && grupos.length === 0 && (
        <Paper variant="outlined" sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Aún no tienes grupos
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Crea tu primer grupo para inscribir estudiantes y consultar su desempeño.
          </Typography>
          <Button variant="contained" onClick={() => setCrearAbierto(true)}>
            Crear grupo
          </Button>
        </Paper>
      )}

      {!cargandoGrupos && !errorGrupos && grupos.length > 0 && (
        <>
          <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
            <SelectorGrupo
              grupos={grupos}
              grupoId={grupoId}
              onChange={cambiarGrupo}
              onCrear={() => setCrearAbierto(true)}
              deshabilitado={cargandoResumen}
            />
            {grupo && (
              <Button
                variant="outlined"
                startIcon={<PersonAddOutlined />}
                onClick={() => setInscribirAbierto(true)}
                sx={{ alignSelf: { lg: 'center' } }}
              >
                Inscribir estudiante
              </Button>
            )}
          </Stack>

          <FiltrosGrupo
            filtros={filtros}
            onCambiar={cambiarFiltro}
            onLimpiar={limpiarFiltros}
            deshabilitado={cargandoResumen}
          />

          {cargandoResumen && (
            <Box role="status" aria-live="polite">
              <Typography sx={{ mb: 1 }}>Cargando indicadores del grupo…</Typography>
              <LinearProgress />
            </Box>
          )}

          {errorResumen && !cargandoResumen && (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  startIcon={<RefreshOutlined />}
                  onClick={() => setRefrescar((valor) => valor + 1)}
                >
                  Reintentar
                </Button>
              }
            >
              {errorResumen}
            </Alert>
          )}

          {resumen && !cargandoResumen && !errorResumen && (
            <>
              <ResumenKpisGrupo resumen={resumen} />
              <DimensionMasDebil dimension={resumen.dimensionMasDebil} />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', lg: '1.35fr 1fr' },
                  gap: 2,
                }}
              >
                <GraficaDimensionesGrupo dimensiones={resumen.dimensiones} />
                <GraficaCategorias distribucion={resumen.distribucionCategorias} />
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
                  gap: 2,
                }}
              >
                <GraficaEvolucionGeneral evolucion={resumen.evolucionGeneral} />
                <TablaEjerciciosErrores ejercicios={resumen.topEjerciciosErrores} />
              </Box>

              {estudiantesEnRiesgo.length > 0 && (
                <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
                  <Typography variant="h6" component="h2" sx={{ mb: 0.5 }}>
                    Estudiantes en riesgo
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {estudiantesEnRiesgo.length} estudiante(s) requieren acompañamiento.
                  </Typography>
                  <Stack spacing={1}>
                    {estudiantesEnRiesgo.map((estudiante) => (
                      <Box
                        key={estudiante.id}
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          justifyContent: 'space-between',
                          gap: 1,
                          p: 1.5,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                        }}
                      >
                        <Box>
                          <Typography sx={{ fontWeight: 600 }}>
                            {estudiante.nombres} {estudiante.apellidos}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {estudiante.motivosRiesgo.join(' · ')}
                          </Typography>
                        </Box>
                        <Button size="small" onClick={() => abrirDetalle(estudiante)}>
                          Ver detalle
                        </Button>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              )}

              <TablaEstudiantes estudiantes={resumen.estudiantes} onVerDetalle={abrirDetalle} />
            </>
          )}
        </>
      )}

      <CrearGrupoDialog
        abierto={crearAbierto}
        onCerrar={() => setCrearAbierto(false)}
        onCreado={(nuevoGrupo) => {
          setCrearAbierto(false);
          setGrupos((anteriores) => [...anteriores, nuevoGrupo]);
          setGrupoId(nuevoGrupo.id);
          actualizarUrl({ grupo: nuevoGrupo.id });
          setRefrescar((valor) => valor + 1);
        }}
      />

      {grupo && (
        <InscribirEstudianteDialog
          abierto={inscribirAbierto}
          grupo={grupo}
          onCerrar={() => setInscribirAbierto(false)}
          onInscrito={() => {
            setInscribirAbierto(false);
            setRefrescar((valor) => valor + 1);
          }}
        />
      )}

      <DetalleEstudianteDrawer
        abierto={Boolean(estudianteId)}
        onCerrar={cerrarDetalle}
        grupoId={grupoId}
        estudianteId={estudianteId}
        filtros={filtros}
      />
    </Stack>
  );
}
