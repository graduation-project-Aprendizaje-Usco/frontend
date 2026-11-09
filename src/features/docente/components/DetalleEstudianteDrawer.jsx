import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import CargandoPagina from '../../../components/CargandoPagina';
import HistorialResultados from '../../../components/HistorialResultados';
import { obtenerDetalleEstudiante } from '../../../api/analiticaApi';
import { mensajeDeError } from '../../../api/errores';
import { formatearNivel, formatearPorcentaje } from '../../progreso/utils/formatearProgreso';

const CATEGORIA = {
  ALTO_RIESGO: { etiqueta: 'Alto riesgo', color: 'error' },
  RIESGO_MODERADO: { etiqueta: 'Riesgo moderado', color: 'warning' },
  NIVEL_ADECUADO: { etiqueta: 'Nivel adecuado', color: 'success' },
  SIN_DIAGNOSTICO: { etiqueta: 'Sin diagnóstico', color: 'default' },
};

export default function DetalleEstudianteDrawer({
  abierto,
  onCerrar,
  grupoId,
  estudianteId,
  filtros,
}) {
  const [detalle, setDetalle] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!abierto || !grupoId || !estudianteId) return undefined;
    let cancelado = false;
    // El estado cambia solo después de la respuesta HTTP.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCargando(true);
    setError('');
    obtenerDetalleEstudiante(grupoId, estudianteId, filtros)
      .then((respuesta) => {
        if (!cancelado) setDetalle(respuesta);
      })
      .catch((e) => {
        if (!cancelado) setError(mensajeDeError(e, 'No pudimos cargar el detalle del estudiante.'));
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [abierto, grupoId, estudianteId, filtros]);

  const estudiante = detalle?.estudiante;
  const categoria = CATEGORIA[estudiante?.categoriaDiagnostico] ?? CATEGORIA.SIN_DIAGNOSTICO;

  return (
    <Drawer
      anchor="right"
      open={abierto}
      onClose={onCerrar}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 560 }, p: { xs: 2, sm: 3 } },
        'aria-labelledby': 'titulo-detalle-estudiante',
      }}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography id="titulo-detalle-estudiante" variant="h5" component="h2" sx={{ fontWeight: 700 }}>
            {estudiante ? `${estudiante.nombres} ${estudiante.apellidos}` : 'Detalle del estudiante'}
          </Typography>
          {estudiante && (
            <Typography variant="body2" color="text.secondary">
              {estudiante.correo}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onCerrar} aria-label="Cerrar detalle del estudiante">
          <CloseOutlined />
        </IconButton>
      </Stack>

      {cargando && <CargandoPagina mensaje="Cargando detalle del estudiante..." />}
      {error && <Alert severity="error">{error}</Alert>}

      {estudiante && !cargando && (
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <Chip label={`Promedio: ${formatearPorcentaje(estudiante.promedio)}`} color="primary" variant="outlined" />
            <Chip label={`Nivel: ${formatearNivel(estudiante.nivel)}`} variant="outlined" />
            <Chip label={`Diagnóstico: ${categoria.etiqueta}`} color={categoria.color} variant="outlined" />
            {estudiante.enRiesgo && <Chip label="En riesgo" color="error" />}
          </Stack>

          {estudiante.enRiesgo && estudiante.motivosRiesgo.length > 0 && (
            <Alert severity="warning">
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Motivos de riesgo
              </Typography>
              <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
                {estudiante.motivosRiesgo.map((motivo) => (
                  <li key={motivo}>{motivo}</li>
                ))}
              </ul>
            </Alert>
          )}

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
              Práctica por dimensión
            </Typography>
            <TableContainer>
              <Table size="small" aria-label="Práctica por dimensión del estudiante">
                <TableHead>
                  <TableRow>
                    <TableCell component="th" scope="col">
                      Dimensión
                    </TableCell>
                    <TableCell component="th" scope="col" align="right">
                      Aciertos
                    </TableCell>
                    <TableCell component="th" scope="col" align="right">
                      Promedio
                    </TableCell>
                    <TableCell component="th" scope="col">
                      Nivel
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detalle.dimensiones.map((dimension) => (
                    <TableRow key={dimension.codigo}>
                      <TableCell component="th" scope="row">
                        {dimension.nombre}
                      </TableCell>
                      <TableCell align="right">
                        {dimension.aciertos} de {dimension.intentos}
                      </TableCell>
                      <TableCell align="right">
                        {dimension.promedio == null ? '—' : formatearPorcentaje(dimension.promedio)}
                      </TableCell>
                      <TableCell>{formatearNivel(dimension.nivel)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
              Último diagnóstico
            </Typography>
            {detalle.ultimoDiagnostico ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {detalle.ultimoDiagnostico.puntaje} de {detalle.ultimoDiagnostico.total} aciertos ·{' '}
                  {CATEGORIA[detalle.ultimoDiagnostico.categoria]?.etiqueta ??
                    detalle.ultimoDiagnostico.categoria}
                </Typography>
                <TableContainer>
                  <Table size="small" aria-label="Dimensiones del último diagnóstico">
                    <TableHead>
                      <TableRow>
                        <TableCell component="th" scope="col">
                          Dimensión
                        </TableCell>
                        <TableCell component="th" scope="col" align="right">
                          Aciertos
                        </TableCell>
                        <TableCell component="th" scope="col" align="right">
                          Porcentaje
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detalle.ultimoDiagnostico.dimensiones.map((dimension) => (
                        <TableRow key={dimension.codigo}>
                          <TableCell component="th" scope="row">
                            {dimension.nombre}
                          </TableCell>
                          <TableCell align="right">
                            {dimension.aciertos} de {dimension.intentos}
                          </TableCell>
                          <TableCell align="right">{formatearPorcentaje(dimension.promedio)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                El estudiante aún no tiene un diagnóstico finalizado en el periodo consultado.
              </Typography>
            )}
          </Paper>

          <Divider />
          <Box>
            <HistorialResultados estudianteId={estudiante.id} />
          </Box>
        </Stack>
      )}
    </Drawer>
  );
}
