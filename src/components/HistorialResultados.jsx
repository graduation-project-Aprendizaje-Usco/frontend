/**
 * Historial de resultados con filtros (SCRUM-169). Reutilizable:
 *  - estudiante: <HistorialResultados /> (su propio historial);
 *  - docente:    <HistorialResultados estudianteId={id} /> (solo estudiantes de sus grupos).
 * Filtra por tipo de actividad, competencia y fechas; 20 filas por página (lo fija el backend).
 */
import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleOutlineOutlined from '@mui/icons-material/CheckCircleOutlineOutlined';
import HighlightOffOutlined from '@mui/icons-material/HighlightOffOutlined';
import { consultar } from '../api/historialApi';
import { mensajeDeError } from '../api/errores';
import CargandoPagina from './CargandoPagina';

const TIPOS = [
  { valor: '', etiqueta: 'Todas' },
  { valor: 'DIAGNOSTICO', etiqueta: 'Diagnóstico' },
  { valor: 'PRACTICA', etiqueta: 'Práctica' },
];

const COMPETENCIAS = [
  { valor: '', etiqueta: 'Todas' },
  { valor: 'ALGEBRAICA', etiqueta: 'Algebraica' },
  { valor: 'LOGICA', etiqueta: 'Razonamiento lógico' },
  { valor: 'FUNCIONAL', etiqueta: 'Comprensión funcional' },
];

const CATEGORIA = {
  ALTO_RIESGO: 'Alto riesgo académico',
  RIESGO_MODERADO: 'Riesgo moderado',
  NIVEL_ADECUADO: 'Nivel adecuado',
};

const FILTROS_INICIALES = { tipo: '', competencia: '', desde: '', hasta: '' };

const formatearFecha = (iso) =>
  new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

function Resultado({ fila }) {
  if (fila.tipo === 'DIAGNOSTICO') {
    return (
      <>
        {fila.aciertos} de {fila.total}
        {fila.categoria && ` · ${CATEGORIA[fila.categoria] ?? fila.categoria}`}
      </>
    );
  }
  const Icono = fila.correcto ? CheckCircleOutlineOutlined : HighlightOffOutlined;
  return (
    <>
      <Box
        component="span"
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap' }}
      >
        <Icono fontSize="small" aria-hidden="true" color={fila.correcto ? 'success' : 'error'} />
        {fila.correcto ? 'Correcto' : 'Incorrecto'}
      </Box>
      <Typography variant="body2" color="text.secondary">
        Nivel {fila.nivel} · {fila.tiempoSeg} s{fila.pistaUsada && ' · con pista'}
      </Typography>
    </>
  );
}

export default function HistorialResultados({ estudianteId }) {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [pagina, setPagina] = useState(0);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelado = false;
    consultar({ ...filtros, page: pagina, estudianteId })
      .then((respuesta) => {
        if (cancelado) return;
        setDatos(respuesta);
        setError('');
      })
      .catch((e) => !cancelado && setError(mensajeDeError(e, 'No pudimos cargar el historial.')));
    return () => {
      cancelado = true;
    };
  }, [filtros, pagina, estudianteId]);

  const cambiarFiltro = (campo) => (evento) => {
    setFiltros((anteriores) => ({ ...anteriores, [campo]: evento.target.value }));
    setPagina(0);
  };

  return (
    <Paper
      variant="outlined"
      component="section"
      aria-labelledby="titulo-historial"
      sx={{ p: { xs: 2, sm: 3 } }}
    >
      <Typography id="titulo-historial" variant="h6" component="h2" gutterBottom>
        Historial de resultados
      </Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap sx={{ mb: 2, flexWrap: 'wrap' }}>
        <TextField
          select
          label="Actividad"
          value={filtros.tipo}
          onChange={cambiarFiltro('tipo')}
          slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
          sx={{ flex: '1 1 170px' }}
        >
          {TIPOS.map((t) => (
            <MenuItem key={t.valor} value={t.valor}>
              {t.etiqueta}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Competencia"
          value={filtros.competencia}
          onChange={cambiarFiltro('competencia')}
          slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
          sx={{ flex: '1 1 170px' }}
        >
          {COMPETENCIAS.map((c) => (
            <MenuItem key={c.valor} value={c.valor}>
              {c.etiqueta}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          type="date"
          label="Desde"
          value={filtros.desde}
          onChange={cambiarFiltro('desde')}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ flex: '1 1 170px' }}
        />
        <TextField
          type="date"
          label="Hasta"
          value={filtros.hasta}
          onChange={cambiarFiltro('hasta')}
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ flex: '1 1 170px' }}
        />
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {!datos && !error && <CargandoPagina />}

      {datos && (
        <>
          <Typography variant="body2" color="text.secondary" aria-live="polite" sx={{ mb: 1 }}>
            {datos.totalElementos === 0
              ? 'No hay actividades con estos filtros.'
              : `${datos.totalElementos} ${datos.totalElementos === 1 ? 'actividad' : 'actividades'}`}
          </Typography>
          {datos.totalElementos > 0 && (
            <>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell component="th" scope="col">
                        Fecha
                      </TableCell>
                      <TableCell component="th" scope="col">
                        Actividad
                      </TableCell>
                      <TableCell component="th" scope="col">
                        Competencia
                      </TableCell>
                      <TableCell component="th" scope="col">
                        Resultado
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {datos.contenido.map((fila) => (
                      <TableRow key={`${fila.tipo}-${fila.id}`}>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                          {formatearFecha(fila.fecha)}
                        </TableCell>
                        <TableCell>
                          {fila.tipo === 'DIAGNOSTICO' ? 'Diagnóstico' : 'Práctica'}
                          <Typography variant="body2" color="text.secondary">
                            {fila.actividad}
                          </Typography>
                        </TableCell>
                        <TableCell>{fila.competenciaNombre ?? 'Todas'}</TableCell>
                        <TableCell>
                          <Resultado fila={fila} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={datos.totalElementos}
                page={datos.pagina}
                rowsPerPage={datos.tamano}
                rowsPerPageOptions={[]}
                onPageChange={(_evento, nueva) => setPagina(nueva)}
                labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
                getItemAriaLabel={(tipo) =>
                  tipo === 'next' ? 'Página siguiente' : 'Página anterior'
                }
              />
            </>
          )}
        </>
      )}
    </Paper>
  );
}
