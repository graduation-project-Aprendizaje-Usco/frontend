import { useEffect, useState } from 'react';
import { Alert, Box, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import { listar } from '../../api/gruposApi';
import { obtenerReporteGrupo } from '../../api/analiticaApi';
import { mensajeDeError } from '../../api/errores';
import AccionesReporte from '../../components/AccionesReporte';
import CargandoPagina from '../../components/CargandoPagina';
import EstilosImpresionReporte from '../../components/EstilosImpresionReporte';
import FiltrosGrupo from './components/FiltrosGrupo';
import ResumenKpisGrupo from './components/ResumenKpisGrupo';
import GraficaDimensionesGrupo from './components/GraficaDimensionesGrupo';
import GraficaCategorias from './components/GraficaCategorias';
import GraficaEvolucionGeneral from './components/GraficaEvolucionGeneral';
import TablaEjerciciosErrores from './components/TablaEjerciciosErrores';
import TablaEstudiantesReporte from './components/TablaEstudiantesReporte';

const FILTROS_INICIALES = { competencia: '', desde: '', hasta: '' };
const COLUMNAS_CSV = ['Sección', 'Indicador', 'Valor'];

function filasCsv(reporte) {
  if (!reporte) return [];
  const filas = [
    ['Grupo', 'Código', reporte.grupo.codigo],
    ['Grupo', 'Nombre', reporte.grupo.nombre],
    ['Resumen', 'Estudiantes inscritos', reporte.totalEstudiantes],
    ['Resumen', 'Estudiantes con actividad', reporte.estudiantesConActividad],
    ['Resumen', 'Promedio general', reporte.promedioGeneral ?? 'Sin actividad'],
    ['Resumen', 'Estudiantes en riesgo', reporte.estudiantesEnRiesgo],
    ...reporte.dimensiones.map((dimension) => [
      'Dimensión',
      `${dimension.nombre} - promedio`,
      dimension.promedio ?? 'Sin actividad',
    ]),
    ...reporte.distribucionCategorias.map((categoria) => [
      'Diagnóstico',
      categoria.categoria,
      categoria.cantidad,
    ]),
    ...reporte.estudiantes.map((estudiante) => [
      'Estudiante',
      `${estudiante.apellidos}, ${estudiante.nombres}`,
      `Riesgo: ${estudiante.enRiesgo ? 'Sí' : 'No'}; promedio: ${estudiante.promedio ?? 'Sin actividad'}; diagnóstico: ${estudiante.categoriaDiagnostico}; intentos: ${estudiante.intentos}`,
    ]),
    ...reporte.topEjerciciosErrores.map((ejercicio) => [
      'Ejercicio',
      ejercicio.codigo,
      `Intentos: ${ejercicio.intentos}; errores: ${ejercicio.errores}; tasa: ${ejercicio.tasaError}%`,
    ]),
    ...reporte.evolucionGeneral.map((semana) => [
      'Evolución semanal',
      semana.fechaInicio,
      `Intentos: ${semana.intentosEvaluados}; aciertos: ${semana.intentosCorrectos}; promedio: ${semana.promedio}%`,
    ]),
  ];
  return filas;
}

export default function ReportesPage() {
  const [grupos, setGrupos] = useState([]);
  const [grupoId, setGrupoId] = useState('');
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [reporte, setReporte] = useState(null);
  const [cargandoGrupos, setCargandoGrupos] = useState(true);
  const [cargandoReporte, setCargandoReporte] = useState(false);
  const [errorGrupos, setErrorGrupos] = useState('');
  const [errorReporte, setErrorReporte] = useState('');
  const [recargar, setRecargar] = useState(0);
  const [recargarGrupos, setRecargarGrupos] = useState(0);

  useEffect(() => {
    document.title = 'Reportes de grupos · Aprendizaje USCO';
    let cancelado = false;
    listar()
      .then((lista) => {
        if (!cancelado) {
          setGrupos(lista);
          setGrupoId(lista[0]?.id ?? '');
          setCargandoReporte(Boolean(lista[0]));
        }
      })
      .catch((error) => {
        if (!cancelado) setErrorGrupos(mensajeDeError(error, 'No pudimos cargar tus grupos.'));
      })
      .finally(() => {
        if (!cancelado) setCargandoGrupos(false);
      });
    return () => {
      cancelado = true;
    };
  }, [recargarGrupos]);

  useEffect(() => {
    if (!grupoId) return undefined;
    if (filtros.desde && filtros.hasta && filtros.desde > filtros.hasta) return undefined;
    let cancelado = false;
    obtenerReporteGrupo(grupoId, filtros)
      .then((respuesta) => {
        if (!cancelado) setReporte(respuesta);
      })
      .catch((error) => {
        if (!cancelado) setErrorReporte(mensajeDeError(error, 'No pudimos cargar el reporte del grupo.'));
      })
      .finally(() => {
        if (!cancelado) setCargandoReporte(false);
      });
    return () => {
      cancelado = true;
    };
  }, [grupoId, filtros, recargar]);

  const cambiarFiltro = (campo, valor) => {
    const siguientes = { ...filtros, [campo]: valor };
    setFiltros(siguientes);
    setCargandoReporte(!(siguientes.desde && siguientes.hasta && siguientes.desde > siguientes.hasta));
    setErrorReporte('');
  };
  const limpiarFiltros = () => {
    setFiltros(FILTROS_INICIALES);
    setCargandoReporte(true);
    setErrorReporte('');
  };
  const cambiarGrupo = (id) => {
    setGrupoId(id);
    setCargandoReporte(true);
    setErrorReporte('');
  };
  const reintentarGrupos = () => {
    setErrorGrupos('');
    setCargandoGrupos(true);
    setRecargarGrupos((valor) => valor + 1);
  };
  const grupo = grupos.find((item) => String(item.id) === String(grupoId));
  const errorFechas = Boolean(filtros.desde && filtros.hasta && filtros.desde > filtros.hasta);
  const nombreArchivo = `reporte-${grupo?.codigo ?? 'grupo'}-${filtros.desde || 'inicio'}-${filtros.hasta || 'actualidad'}`;

  return (
    <>
      <EstilosImpresionReporte />
      <Stack
        data-reporte-print
        spacing={3}
        sx={{ maxWidth: 1250, mx: 'auto', pb: 4, '@media print': { maxWidth: 'none', mx: 0, pb: 0 } }}
      >
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Reportes de mis grupos
        </Typography>
        <Typography color="text.secondary">
          Revisa el desempeño, los diagnósticos y los estudiantes que requieren acompañamiento.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, '@media print': { display: 'none' } }}>
        <Stack spacing={2}>
          {cargandoGrupos ? (
            <CargandoPagina mensaje="Cargando tus grupos..." />
          ) : errorGrupos ? (
            <Alert severity="error" action={
              <Button
                color="inherit"
                size="small"
                startIcon={<RefreshOutlined />}
                onClick={reintentarGrupos}
              >
                Reintentar
              </Button>
            }>
              {errorGrupos}
            </Alert>
          ) : grupos.length === 0 ? (
            <Typography color="text.secondary">Aún no tienes grupos para consultar.</Typography>
          ) : (
            <>
              <TextField
                select
                label="Grupo"
                value={grupoId}
                onChange={(evento) => cambiarGrupo(evento.target.value)}
                sx={{ maxWidth: { sm: 460 } }}
              >
                {grupos.map((item) => (
                  <MenuItem key={item.id} value={item.id}>{item.codigo} — {item.nombre}</MenuItem>
                ))}
              </TextField>
              <FiltrosGrupo
                filtros={filtros}
                onCambiar={cambiarFiltro}
                onLimpiar={limpiarFiltros}
                deshabilitado={cargandoReporte}
              />
              {errorFechas && <Alert severity="warning">La fecha inicial no puede ser posterior a la fecha final.</Alert>}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshOutlined />}
                  onClick={() => {
                    setCargandoReporte(true);
                    setErrorReporte('');
                    setRecargar((valor) => valor + 1);
                  }}
                  disabled={cargandoReporte || errorFechas}
                >
                  Actualizar reporte
                </Button>
                <AccionesReporte
                  nombreArchivo={nombreArchivo}
                  columnas={COLUMNAS_CSV}
                  filas={filasCsv(reporte)}
                  deshabilitado={!reporte || cargandoReporte || Boolean(errorReporte) || errorFechas}
                />
              </Stack>
            </>
          )}
        </Stack>
      </Paper>

      {errorReporte && <Alert severity="error">{errorReporte}</Alert>}
      {cargandoReporte && <CargandoPagina mensaje="Preparando el reporte..." />}
      {!cargandoReporte && !errorReporte && !errorFechas && reporte && (
        <>
          <Typography variant="subtitle1" color="text.secondary">
            Grupo: <strong>{reporte.grupo.codigo} — {reporte.grupo.nombre}</strong>
            {filtros.desde || filtros.hasta
              ? ` · Periodo: ${filtros.desde || 'sin inicio'} a ${filtros.hasta || 'actualidad'}`
              : ' · Todo el historial'}
          </Typography>
          <ResumenKpisGrupo resumen={reporte} />
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2 }}>
            <GraficaDimensionesGrupo dimensiones={reporte.dimensiones} />
            <GraficaCategorias distribucion={reporte.distribucionCategorias} />
          </Box>
          <GraficaEvolucionGeneral evolucion={reporte.evolucionGeneral} />
          <TablaEjerciciosErrores ejercicios={reporte.topEjerciciosErrores} />
          <TablaEstudiantesReporte estudiantes={reporte.estudiantes} />
        </>
      )}
      </Stack>
    </>
  );
}
