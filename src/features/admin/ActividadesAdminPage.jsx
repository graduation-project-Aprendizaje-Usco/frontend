/**
 * Catálogo de solo lectura de contenidos y ejercicios para el administrador
 * (SCRUM-46). La gestión la hacen los docentes; el administrador consulta qué
 * actividades existen y quién las creó.
 */
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  Alert,
  Box,
  Chip,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import CargandoPagina from '../../components/CargandoPagina';
import { obtener } from '../../api/adminActividadesApi';
import { mensajeDeError } from '../../api/errores';
import {
  ASIGNATURAS,
  etiquetaCompetencia,
  NIVELES,
  TIPOS,
} from '../docente/actividades/catalogos';

const etiquetaAsignatura = (valor) =>
  ASIGNATURAS.find((asignatura) => asignatura.valor === valor)?.etiqueta ?? valor;

const etiquetaNivel = (valor) =>
  NIVELES.find((nivel) => nivel.valor === valor)?.etiqueta ?? valor;

const etiquetaTipo = (valor) =>
  TIPOS.find((tipo) => tipo.valor === valor)?.etiqueta ?? valor;

function ChipEstado({ activo }) {
  return (
    <Chip
      size="small"
      label={activo ? 'Activo' : 'Inactivo'}
      color={activo ? 'success' : 'default'}
      variant="outlined"
    />
  );
}

function TablaContenidos({ contenidos }) {
  if (contenidos.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography color="text.secondary">No hay contenidos con esta búsqueda.</Typography>
      </Paper>
    );
  }
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" aria-label="Contenidos de todos los docentes">
        <TableHead>
          <TableRow>
            <TableCell component="th" scope="col">Contenido</TableCell>
            <TableCell component="th" scope="col">Competencia</TableCell>
            <TableCell component="th" scope="col">Asignatura</TableCell>
            <TableCell component="th" scope="col">Docente</TableCell>
            <TableCell component="th" scope="col" align="right">Ejercicios</TableCell>
            <TableCell component="th" scope="col">Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contenidos.map((contenido) => (
            <TableRow key={contenido.id}>
              <TableCell component="th" scope="row">
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{contenido.titulo}</Typography>
                <Typography variant="caption" color="text.secondary">{contenido.tema}</Typography>
              </TableCell>
              <TableCell>{etiquetaCompetencia(contenido.competenciaCodigo)}</TableCell>
              <TableCell>{etiquetaAsignatura(contenido.asignatura)}</TableCell>
              <TableCell sx={{ overflowWrap: 'anywhere' }}>
                {contenido.creadoPorCorreo ?? 'Semilla'}
              </TableCell>
              <TableCell align="right">{contenido.totalEjercicios}</TableCell>
              <TableCell><ChipEstado activo={contenido.activo} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function TablaEjercicios({ ejercicios }) {
  if (ejercicios.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography color="text.secondary">No hay ejercicios con esta búsqueda.</Typography>
      </Paper>
    );
  }
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small" aria-label="Ejercicios de todos los docentes">
        <TableHead>
          <TableRow>
            <TableCell component="th" scope="col">Ejercicio</TableCell>
            <TableCell component="th" scope="col">Contenido</TableCell>
            <TableCell component="th" scope="col">Competencia</TableCell>
            <TableCell component="th" scope="col">Nivel</TableCell>
            <TableCell component="th" scope="col">Tipo</TableCell>
            <TableCell component="th" scope="col">Docente</TableCell>
            <TableCell component="th" scope="col">Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ejercicios.map((ejercicio) => (
            <TableRow key={ejercicio.id}>
              <TableCell component="th" scope="row">{ejercicio.codigo}</TableCell>
              <TableCell>{ejercicio.contenidoTitulo}</TableCell>
              <TableCell>{etiquetaCompetencia(ejercicio.competenciaCodigo)}</TableCell>
              <TableCell>{etiquetaNivel(ejercicio.nivel)}</TableCell>
              <TableCell>{etiquetaTipo(ejercicio.tipo)}</TableCell>
              <TableCell sx={{ overflowWrap: 'anywhere' }}>
                {ejercicio.creadoPorCorreo ?? 'Semilla'}
              </TableCell>
              <TableCell><ChipEstado activo={ejercicio.activo} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function ActividadesAdminPage() {
  const [parametros, setParametros] = useSearchParams();
  const tab = parametros.get('tab') === 'ejercicios' ? 1 : 0;
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    document.title = 'Actividades · Aprendizaje USCO';
    obtener()
      .then(setDatos)
      .catch((e) => setError(mensajeDeError(e, 'No pudimos cargar las actividades.')));
  }, []);

  const contenidos = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    const lista = datos?.contenidos ?? [];
    if (!termino) return lista;
    return lista.filter((contenido) =>
      `${contenido.titulo} ${contenido.tema} ${contenido.competenciaCodigo} ${contenido.asignatura} ${contenido.creadoPorCorreo ?? ''}`
        .toLowerCase()
        .includes(termino),
    );
  }, [datos, busqueda]);

  const ejercicios = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    const lista = datos?.ejercicios ?? [];
    if (!termino) return lista;
    return lista.filter((ejercicio) =>
      `${ejercicio.codigo} ${ejercicio.contenidoTitulo} ${ejercicio.competenciaCodigo} ${ejercicio.creadoPorCorreo ?? ''}`
        .toLowerCase()
        .includes(termino),
    );
  }, [datos, busqueda]);

  const cambiarTab = (_evento, valor) => {
    setParametros(valor === 1 ? { tab: 'ejercicios' } : { tab: 'contenidos' }, { replace: true });
  };

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!datos) return <CargandoPagina mensaje="Cargando actividades..." />;

  return (
    <Stack spacing={3} sx={{ maxWidth: 1200 }}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Actividades
        </Typography>
        <Typography color="text.secondary">
          Contenidos y ejercicios creados por los docentes y por el banco semilla.
        </Typography>
      </Box>

      <TextField
        label="Buscar por título, código, competencia o docente"
        value={busqueda}
        onChange={(evento) => setBusqueda(evento.target.value)}
        slotProps={{
          input: {
            startAdornment: <SearchOutlined fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
          },
        }}
        sx={{ maxWidth: 460 }}
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={cambiarTab} aria-label="Contenidos y ejercicios">
          <Tab label={`Contenidos (${contenidos.length})`} />
          <Tab label={`Ejercicios (${ejercicios.length})`} />
        </Tabs>
      </Box>

      {tab === 0 ? (
        <TablaContenidos contenidos={contenidos} />
      ) : (
        <TablaEjercicios ejercicios={ejercicios} />
      )}
    </Stack>
  );
}
