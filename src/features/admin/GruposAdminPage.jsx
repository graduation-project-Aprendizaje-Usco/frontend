/**
 * Vista de solo lectura de los grupos para el administrador (SCRUM-46).
 * Los docentes siguen gestionando sus grupos; aquí el administrador puede
 * consultarlos y ver quién está inscrito en cada uno.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
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
  TextField,
  Typography,
} from '@mui/material';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import SearchOutlined from '@mui/icons-material/SearchOutlined';
import CargandoPagina from '../../components/CargandoPagina';
import { estudiantes, listar } from '../../api/gruposApi';
import { mensajeDeError } from '../../api/errores';

export default function GruposAdminPage() {
  const [grupos, setGrupos] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [error, setError] = useState('');
  const [grupoAbierto, setGrupoAbierto] = useState(null);
  const [estudiantesDelGrupo, setEstudiantesDelGrupo] = useState(null);
  const [cargandoEstudiantes, setCargandoEstudiantes] = useState(false);
  const [errorEstudiantes, setErrorEstudiantes] = useState('');

  useEffect(() => {
    document.title = 'Grupos · Aprendizaje USCO';
    listar()
      .then(setGrupos)
      .catch((e) => setError(mensajeDeError(e, 'No pudimos cargar los grupos.')));
  }, []);

  const cargarEstudiantes = useCallback(async (grupo) => {
    setCargandoEstudiantes(true);
    setErrorEstudiantes('');
    setEstudiantesDelGrupo(null);
    try {
      setEstudiantesDelGrupo(await estudiantes(grupo.id));
    } catch (e) {
      setErrorEstudiantes(mensajeDeError(e, 'No pudimos cargar los estudiantes del grupo.'));
    } finally {
      setCargandoEstudiantes(false);
    }
  }, []);

  const abrirGrupo = (grupo) => {
    setGrupoAbierto(grupo);
    cargarEstudiantes(grupo);
  };

  const filas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return grupos ?? [];
    return (grupos ?? []).filter((grupo) =>
      `${grupo.codigo} ${grupo.nombre} ${grupo.docenteCorreo}`.toLowerCase().includes(termino),
    );
  }, [grupos, busqueda]);

  if (!grupos && !error) return <CargandoPagina mensaje="Cargando grupos..." />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Stack spacing={3} sx={{ maxWidth: 1100 }}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Grupos
        </Typography>
        <Typography color="text.secondary">
          Consulta los grupos creados por los docentes y sus estudiantes inscritos.
        </Typography>
      </Box>

      <TextField
        label="Buscar por código, nombre o docente"
        value={busqueda}
        onChange={(evento) => setBusqueda(evento.target.value)}
        slotProps={{
          input: {
            startAdornment: <SearchOutlined fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
          },
        }}
        sx={{ maxWidth: 420 }}
      />

      <Paper variant="outlined" component="section" aria-labelledby="titulo-tabla-grupos">
        <Typography
          id="titulo-tabla-grupos"
          variant="body2"
          color="text.secondary"
          aria-live="polite"
          sx={{ p: 2 }}
        >
          {filas.length === 0
            ? 'No hay grupos con esta búsqueda.'
            : `${filas.length} ${filas.length === 1 ? 'grupo' : 'grupos'}`}
        </Typography>
        {filas.length > 0 && (
          <TableContainer>
            <Table size="small" aria-label="Grupos de los docentes">
              <TableHead>
                <TableRow>
                  <TableCell component="th" scope="col">Grupo</TableCell>
                  <TableCell component="th" scope="col">Docente</TableCell>
                  <TableCell component="th" scope="col" align="right">Estudiantes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filas.map((grupo) => (
                  <TableRow key={grupo.id} hover>
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{grupo.nombre}</Typography>
                      <Typography variant="caption" color="text.secondary">{grupo.codigo}</Typography>
                    </TableCell>
                    <TableCell sx={{ overflowWrap: 'anywhere' }}>{grupo.docenteCorreo}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => abrirGrupo(grupo)} aria-label={`Ver estudiantes de ${grupo.nombre}`}>
                        Ver estudiantes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Drawer
        anchor="right"
        open={Boolean(grupoAbierto)}
        onClose={() => setGrupoAbierto(null)}
        slotProps={{
          paper: {
            sx: { width: { xs: '100%', sm: 520 }, p: 3 },
            'aria-labelledby': 'titulo-estudiantes-grupo',
          },
        }}
      >
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography id="titulo-estudiantes-grupo" variant="h5" component="h2" sx={{ fontWeight: 700 }}>
              {grupoAbierto?.nombre ?? 'Estudiantes del grupo'}
            </Typography>
            {grupoAbierto && (
              <Typography variant="body2" color="text.secondary">{grupoAbierto.codigo}</Typography>
            )}
          </Box>
          <IconButton onClick={() => setGrupoAbierto(null)} aria-label="Cerrar estudiantes del grupo">
            <CloseOutlined />
          </IconButton>
        </Stack>

        {cargandoEstudiantes && <CargandoPagina mensaje="Cargando estudiantes..." />}
        {errorEstudiantes && <Alert severity="error">{errorEstudiantes}</Alert>}

        {estudiantesDelGrupo && !cargandoEstudiantes && (
          estudiantesDelGrupo.length === 0 ? (
            <Typography color="text.secondary">Este grupo todavía no tiene estudiantes inscritos.</Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small" aria-label="Estudiantes del grupo">
                <TableHead>
                  <TableRow>
                    <TableCell component="th" scope="col">Estudiante</TableCell>
                    <TableCell component="th" scope="col">Correo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {estudiantesDelGrupo.map((estudiante) => (
                    <TableRow key={estudiante.id}>
                      <TableCell component="th" scope="row">
                        {estudiante.apellidos}, {estudiante.nombres}
                      </TableCell>
                      <TableCell sx={{ overflowWrap: 'anywhere' }}>{estudiante.correo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        )}
      </Drawer>
    </Stack>
  );
}
