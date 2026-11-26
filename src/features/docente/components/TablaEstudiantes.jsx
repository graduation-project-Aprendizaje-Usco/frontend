import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import { formatearNivel, formatearPorcentaje } from '../../progreso/utils/formatearProgreso';

const CATEGORIA = {
  ALTO_RIESGO: { etiqueta: 'Alto riesgo', color: 'error' },
  RIESGO_MODERADO: { etiqueta: 'Riesgo moderado', color: 'warning' },
  NIVEL_ADECUADO: { etiqueta: 'Nivel adecuado', color: 'success' },
  SIN_DIAGNOSTICO: { etiqueta: 'Sin diagnóstico', color: 'default' },
};

const COLUMNAS = [
  { campo: 'apellidos', etiqueta: 'Estudiante', numerica: false },
  { campo: 'correo', etiqueta: 'Correo', numerica: false, ocultarEnMovil: true },
  { campo: 'promedio', etiqueta: 'Promedio', numerica: true },
  { campo: 'nivel', etiqueta: 'Nivel', numerica: false },
  { campo: 'categoriaDiagnostico', etiqueta: 'Diagnóstico', numerica: false },
  { campo: 'intentos', etiqueta: 'Intentos', numerica: true },
];

export default function TablaEstudiantes({ estudiantes = [], onVerDetalle }) {
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState({ campo: 'apellidos', direccion: 'asc' });

  const filas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    const filtradas = estudiantes.filter((estudiante) => {
      if (!termino) return true;
      return `${estudiante.nombres} ${estudiante.apellidos} ${estudiante.correo}`
        .toLowerCase()
        .includes(termino);
    });

    return [...filtradas].sort((a, b) => {
      const valorA = a[orden.campo];
      const valorB = b[orden.campo];
      if (valorA == null && valorB == null) return 0;
      if (valorA == null) return 1;
      if (valorB == null) return -1;
      const comparacion =
        typeof valorA === 'number' && typeof valorB === 'number'
          ? valorA - valorB
          : String(valorA).localeCompare(String(valorB), 'es');
      return orden.direccion === 'asc' ? comparacion : -comparacion;
    });
  }, [estudiantes, busqueda, orden]);

  const cambiarOrden = (campo) => {
    setOrden((anterior) => ({
      campo,
      direccion: anterior.campo === campo && anterior.direccion === 'asc' ? 'desc' : 'asc',
    }));
  };

  if (estudiantes.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
          Estudiantes del grupo
        </Typography>
        <Typography color="text.secondary">
          Este grupo todavía no tiene estudiantes inscritos. Usa “Inscribir estudiante” para agregarlos.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 2 }}
      >
        <Box>
          <Typography variant="h6" component="h2">
            Estudiantes del grupo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {filas.length} de {estudiantes.length} estudiantes
          </Typography>
        </Box>
        <TextField
          size="small"
          label="Buscar estudiante"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          slotProps={{
            input: {
              startAdornment: <SearchOutlined fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
            },
          }}
          sx={{ minWidth: { xs: '100%', sm: 260 } }}
        />
      </Stack>

      <TableContainer>
        <Table size="small" aria-label="Estudiantes del grupo">
          <TableHead>
            <TableRow>
              {COLUMNAS.map((columna) => (
                <TableCell
                  key={columna.campo}
                  component="th"
                  scope="col"
                  align={columna.numerica ? 'right' : 'left'}
                  sx={columna.ocultarEnMovil ? { display: { xs: 'none', sm: 'table-cell' } } : undefined}
                >
                  <TableSortLabel
                    active={orden.campo === columna.campo}
                    direction={orden.campo === columna.campo ? orden.direccion : 'asc'}
                    onClick={() => cambiarOrden(columna.campo)}
                  >
                    {columna.etiqueta}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell component="th" scope="col" align="right">
                Detalle
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filas.map((estudiante) => {
              const categoria = CATEGORIA[estudiante.categoriaDiagnostico] ?? CATEGORIA.SIN_DIAGNOSTICO;
              return (
                <TableRow key={estudiante.id} hover>
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {estudiante.apellidos}, {estudiante.nombres}
                    </Typography>
                    <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap', mt: 0.5 }}>
                      {estudiante.enRiesgo && (
                        <Chip size="small" color="error" label="En riesgo" variant="outlined" />
                      )}
                      {estudiante.sinActividad && (
                        <Chip size="small" label="Sin actividad" variant="outlined" />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                    {estudiante.correo}
                  </TableCell>
                  <TableCell align="right">
                    {estudiante.promedio == null ? '—' : formatearPorcentaje(estudiante.promedio)}
                  </TableCell>
                  <TableCell>{formatearNivel(estudiante.nivel)}</TableCell>
                  <TableCell>
                    <Chip size="small" color={categoria.color} label={categoria.etiqueta} variant="outlined" />
                  </TableCell>
                  <TableCell align="right">{estudiante.intentos}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      onClick={() => onVerDetalle(estudiante)}
                      aria-label={`Ver detalle de ${estudiante.nombres} ${estudiante.apellidos}`}
                    >
                      Ver detalle
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {filas.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No hay estudiantes que coincidan con la búsqueda.
        </Typography>
      )}
    </Paper>
  );
}
