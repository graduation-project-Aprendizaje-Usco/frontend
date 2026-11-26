import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import AccionesReporte from '../../components/AccionesReporte';
import CargandoPagina from '../../components/CargandoPagina';
import EstilosImpresionReporte from '../../components/EstilosImpresionReporte';
import { obtenerReporteAdmin } from '../../api/adminReportesApi';
import { mensajeDeError } from '../../api/errores';

const ROLES = {
  ESTUDIANTE: 'Estudiantes',
  DOCENTE: 'Docentes',
  ADMIN: 'Administradores',
};
const CATEGORIAS = {
  ALTO_RIESGO: 'Alto riesgo',
  RIESGO_MODERADO: 'Riesgo moderado',
  NIVEL_ADECUADO: 'Nivel adecuado',
};
const COLUMNAS_CSV = ['Sección', 'Indicador', 'Valor'];

function filasCsv(reporte) {
  if (!reporte) return [];
  const { resumenSistema, practica, diagnostico } = reporte;
  return [
    ...resumenSistema.usuariosPorRol.map((fila) => [
      'Usuarios',
      ROLES[fila.rol] ?? fila.rol,
      `Total: ${fila.total}; activos: ${fila.activos}`,
    ]),
    ['Sistema', 'Grupos', resumenSistema.grupos],
    ['Sistema', 'Contenidos activos', resumenSistema.contenidosActivos],
    ['Sistema', 'Ejercicios activos', resumenSistema.ejerciciosActivos],
    ['Práctica', 'Intentos', practica.intentos],
    ['Práctica', 'Aciertos', practica.aciertos],
    ['Práctica', 'Porcentaje de acierto', `${practica.porcentajeAcierto}%`],
    ['Práctica', 'Estudiantes con actividad', practica.estudiantesConActividad],
    ['Diagnóstico', 'Finalizados', diagnostico.finalizados],
    ['Diagnóstico', 'Puntaje promedio', diagnostico.puntajePromedio ?? 'Sin resultados'],
    ['Diagnóstico', 'Porcentaje promedio', diagnostico.porcentajePromedio == null ? 'Sin resultados' : `${diagnostico.porcentajePromedio}%`],
    ['Diagnóstico', 'Estudiantes con actividad', diagnostico.estudiantesConActividad],
    ...diagnostico.distribucion.map((fila) => [
      'Distribución diagnóstica',
      CATEGORIAS[fila.categoria] ?? fila.categoria,
      fila.cantidad,
    ]),
  ];
}

function Tarjeta({ titulo, valor, detalle }) {
  return (
    <Paper variant="outlined" component="section" aria-label={titulo} sx={{ p: 2.5, borderRadius: 2 }}>
      <Typography variant="body2" color="text.secondary" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
        {titulo}
      </Typography>
      <Typography variant="h5" component="p" sx={{ fontWeight: 700 }}>
        {valor}
      </Typography>
      {detalle && <Typography variant="body2" color="text.secondary">{detalle}</Typography>}
    </Paper>
  );
}

export default function ReportesAdminPage() {
  const [filtros, setFiltros] = useState({ desde: '', hasta: '' });
  const [aplicados, setAplicados] = useState({ desde: '', hasta: '' });
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [errorFechas, setErrorFechas] = useState('');
  const [recargar, setRecargar] = useState(0);

  useEffect(() => {
    document.title = 'Reportes administrativos · Aprendizaje USCO';
  }, []);

  useEffect(() => {
    let cancelado = false;
    obtenerReporteAdmin(aplicados)
      .then((respuesta) => {
        if (!cancelado) setReporte(respuesta);
      })
      .catch((e) => {
        if (!cancelado) setError(mensajeDeError(e, 'No pudimos cargar el reporte administrativo.'));
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [aplicados, recargar]);

  const aplicarFiltros = () => {
    if (filtros.desde && filtros.hasta && filtros.desde > filtros.hasta) {
      setErrorFechas('La fecha inicial no puede ser posterior a la fecha final.');
      return;
    }
    setErrorFechas('');
    setCargando(true);
    setError('');
    setAplicados({ ...filtros });
  };

  const limpiarFiltros = () => {
    setFiltros({ desde: '', hasta: '' });
    setErrorFechas('');
    setCargando(true);
    setError('');
    setAplicados({ desde: '', hasta: '' });
  };

  const actualizar = () => {
    setCargando(true);
    setError('');
    setRecargar((valor) => valor + 1);
  };

  const periodo = reporte?.desde || reporte?.hasta
    ? `${reporte.desde || 'Sin inicio'} a ${reporte.hasta || 'Actualidad'}`
    : 'Todo el historial';

  return (
    <>
      <EstilosImpresionReporte />
      <Stack
        data-reporte-print
        spacing={3}
        sx={{ maxWidth: 1200, mx: 'auto', pb: 4, '@media print': { maxWidth: 'none', mx: 0, pb: 0 } }}
      >
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Reportes administrativos
        </Typography>
        <Typography color="text.secondary">
          Consulta indicadores agregados del sistema, actividad de práctica y resultados diagnósticos.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, '@media print': { display: 'none' } }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ alignItems: { md: 'center' } }}>
          <TextField
            type="date"
            label="Desde"
            value={filtros.desde}
            onChange={(evento) => setFiltros((anterior) => ({ ...anterior, desde: evento.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            type="date"
            label="Hasta"
            value={filtros.hasta}
            onChange={(evento) => setFiltros((anterior) => ({ ...anterior, hasta: evento.target.value }))}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <Button
            variant="contained"
            onClick={aplicarFiltros}
            disabled={cargando}
          >
            Aplicar periodo
          </Button>
          <Button variant="text" onClick={limpiarFiltros} disabled={cargando}>
            Limpiar
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshOutlined />}
            onClick={actualizar}
            disabled={cargando}
          >
            Actualizar
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <AccionesReporte
            nombreArchivo={`reporte-administrativo-${reporte?.desde || 'inicio'}-${reporte?.hasta || 'actualidad'}`}
            columnas={COLUMNAS_CSV}
            filas={filasCsv(reporte)}
            deshabilitado={!reporte || cargando || Boolean(error)}
          />
        </Stack>
        {errorFechas && <Alert severity="warning" sx={{ mt: 2 }}>{errorFechas}</Alert>}
      </Paper>

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" startIcon={<RefreshOutlined />} onClick={actualizar}>
              Reintentar
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      {cargando && <CargandoPagina mensaje="Preparando el reporte administrativo..." />}
      {!cargando && !error && reporte && (
        <>
          <Typography variant="subtitle1" color="text.secondary">
            Periodo: <strong>{periodo}</strong>
          </Typography>

          <Typography variant="h5" component="h2">Resumen del sistema</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }, gap: 2 }}>
            {reporte.resumenSistema.usuariosPorRol.map((fila) => (
              <Tarjeta
                key={fila.rol}
                titulo={ROLES[fila.rol] ?? fila.rol}
                valor={fila.total}
                detalle={`${fila.activos} activos`}
              />
            ))}
            <Tarjeta titulo="Grupos" valor={reporte.resumenSistema.grupos} detalle="Grupos creados" />
            <Tarjeta titulo="Contenidos activos" valor={reporte.resumenSistema.contenidosActivos} />
            <Tarjeta titulo="Ejercicios activos" valor={reporte.resumenSistema.ejerciciosActivos} />
          </Box>

          <Typography variant="h5" component="h2">Actividad de práctica</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
            <Tarjeta titulo="Intentos" valor={reporte.practica.intentos} />
            <Tarjeta titulo="Aciertos" valor={reporte.practica.aciertos} />
            <Tarjeta titulo="Tasa de acierto" valor={`${reporte.practica.porcentajeAcierto}%`} />
            <Tarjeta titulo="Estudiantes con actividad" valor={reporte.practica.estudiantesConActividad} />
          </Box>

          <Typography variant="h5" component="h2">Resultados diagnósticos</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
            <Tarjeta titulo="Diagnósticos finalizados" valor={reporte.diagnostico.finalizados} />
            <Tarjeta
              titulo="Puntaje promedio"
              valor={reporte.diagnostico.puntajePromedio ?? '—'}
              detalle="Respuestas correctas por intento"
            />
            <Tarjeta
              titulo="Porcentaje promedio"
              valor={reporte.diagnostico.porcentajePromedio == null ? '—' : `${reporte.diagnostico.porcentajePromedio}%`}
            />
            <Tarjeta titulo="Estudiantes con actividad" valor={reporte.diagnostico.estudiantesConActividad} />
          </Box>

          <Paper variant="outlined" component="section" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
            <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
              Distribución de resultados diagnósticos
            </Typography>
            <TableContainer>
              <Table size="small" aria-label="Distribución de resultados diagnósticos">
                <TableHead>
                  <TableRow>
                    <TableCell component="th" scope="col">Categoría</TableCell>
                    <TableCell component="th" scope="col" align="right">Diagnósticos</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reporte.diagnostico.distribucion.map((fila) => (
                    <TableRow key={fila.categoria}>
                      <TableCell component="th" scope="row">
                        {CATEGORIAS[fila.categoria] ?? fila.categoria}
                      </TableCell>
                      <TableCell align="right">{fila.cantidad}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
      </Stack>
    </>
  );
}
