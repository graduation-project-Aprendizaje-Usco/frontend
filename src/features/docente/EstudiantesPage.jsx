/**
 * Estudiantes e invitaciones del grupo (#150/#155).
 * El docente elige un grupo, carga un CSV (correo;nombres;apellidos) y ve el
 * estado de cada invitación. El enlace de registro se envía por correo.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
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
import DownloadOutlined from '@mui/icons-material/DownloadOutlined';
import UploadFileOutlined from '@mui/icons-material/UploadFileOutlined';
import CargandoPagina from '../../components/CargandoPagina';
import InvitarEstudianteCard from './components/InvitarEstudianteCard';
import { listar as listarGrupos } from '../../api/gruposApi';
import {
  cargarInvitaciones,
  listarInvitaciones,
  reenviarInvitacion,
} from '../../api/invitacionesApi';
import { mensajeDeError } from '../../api/errores';

const ESTADO = {
  INVITADO: { label: 'Invitado', color: 'info' },
  REGISTRADO: { label: 'Registrado', color: 'success' },
  VENCIDA: { label: 'Vencida', color: 'warning' },
};

function parsearCsv(texto) {
  const lineas = texto.split(/\r?\n/).map((linea) => linea.trim()).filter(Boolean);
  if (lineas.length === 0) throw new Error('El archivo está vacío.');
  const separador = lineas[0].includes(';') ? ';' : ',';
  const filas = lineas.map((linea) =>
    linea.split(separador).map((celda) => celda.trim().replace(/^"|"$/g, '')),
  );
  if (filas[0][0]?.toLowerCase().includes('correo')) filas.shift();
  return filas
    .filter((fila) => fila.some(Boolean))
    .map((fila, indice) => {
      if (fila.length < 3 || !fila[0] || !fila[1] || !fila[2]) {
        throw new Error(`La fila ${indice + 1} debe tener correo, nombres y apellidos.`);
      }
      return { correo: fila[0], nombres: fila[1], apellidos: fila[2] };
    });
}

export default function EstudiantesPage() {
  const [grupos, setGrupos] = useState(null);
  const [grupoId, setGrupoId] = useState('');
  const [invitaciones, setInvitaciones] = useState([]);
  const [filasCsv, setFilasCsv] = useState([]);
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    document.title = 'Estudiantes · Aprendizaje USCO';
    listarGrupos()
      .then((lista) => {
        setGrupos(lista);
        setGrupoId(lista[0]?.id ?? '');
        if (lista.length === 0) setCargando(false);
      })
      .catch((e) => {
        setError(mensajeDeError(e, 'No pudimos cargar tus grupos.'));
        setCargando(false);
      });
  }, []);

  const cargar = useCallback(async () => {
    if (!grupoId) return;
    setCargando(true);
    setError('');
    try {
      setInvitaciones(await listarInvitaciones(grupoId));
    } catch (e) {
      setError(mensajeDeError(e, 'No pudimos cargar las invitaciones.'));
    } finally {
      setCargando(false);
    }
  }, [grupoId]);

  useEffect(() => {
    // cargar cambia el estado solo después de la respuesta HTTP.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
  }, [cargar]);

  const resumen = useMemo(() => ({
    invitados: invitaciones.filter((i) => i.estado === 'INVITADO').length,
    registrados: invitaciones.filter((i) => i.estado === 'REGISTRADO').length,
  }), [invitaciones]);

  const leerArchivo = async (evento) => {
    const archivo = evento.target.files?.[0];
    setError('');
    setAviso('');
    setFilasCsv([]);
    setNombreArchivo('');
    if (!archivo) return;
    try {
      const texto = await archivo.text();
      setFilasCsv(parsearCsv(texto));
      setNombreArchivo(archivo.name);
    } catch (e) {
      setError(e.message);
    } finally {
      evento.target.value = '';
    }
  };

  const enviar = async () => {
    if (!grupoId || filasCsv.length === 0) return;
    setEnviando(true);
    setError('');
    setAviso('');
    try {
      await cargarInvitaciones(grupoId, filasCsv);
      setAviso(`Se enviaron ${filasCsv.length} invitaciones.`);
      setFilasCsv([]);
      setNombreArchivo('');
      await cargar();
    } catch (e) {
      setError(mensajeDeError(e, 'No pudimos cargar el listado.'));
    } finally {
      setEnviando(false);
    }
  };

  const reenviar = async (invitacion) => {
    setError('');
    setAviso('');
    try {
      await reenviarInvitacion(grupoId, invitacion.id);
      setAviso(`Invitación reenviada a ${invitacion.correo}.`);
      await cargar();
    } catch (e) {
      setError(mensajeDeError(e, 'No pudimos reenviar la invitación.'));
    }
  };

  const descargarPlantilla = () => {
    const contenido = 'correo;nombres;apellidos\nu20201234567@usco.edu.co;Ana María;Pérez Gómez\n';
    const url = URL.createObjectURL(new Blob([contenido], { type: 'text/csv;charset=utf-8' }));
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'plantilla-estudiantes.csv';
    enlace.click();
    URL.revokeObjectURL(url);
  };

  if (grupos === null && !error) return <CargandoPagina mensaje="Cargando tus grupos..." />;
  if (error && grupos === null) return <Alert severity="error">{error}</Alert>;

  return (
    <Stack spacing={3} sx={{ maxWidth: 1100 }}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Estudiantes e invitaciones
        </Typography>
        <Typography color="text.secondary">
          Invita individualmente o carga el listado del grupo; cada estudiante recibe un enlace
          de un solo uso para crear su cuenta.
        </Typography>
      </Box>

      {grupos?.length === 0 ? (
        <Alert severity="info">Todavía no tienes grupos. Crea uno desde el inicio del docente.</Alert>
      ) : (
        <>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <TextField
              select
              label="Grupo"
              value={grupoId}
              onChange={(evento) => setGrupoId(Number(evento.target.value))}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ minWidth: 260 }}
            >
              {(grupos ?? []).map((grupo) => (
                <MenuItem key={grupo.id} value={grupo.id}>{grupo.nombre} ({grupo.codigo})</MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ alignItems: 'stretch' }}>
            <InvitarEstudianteCard grupoId={grupoId} onInvitado={cargar} />

            <Paper variant="outlined" sx={{ flex: 1, minWidth: 0, p: 2 }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
                    <UploadFileOutlined />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="h2">Carga masiva</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Invita a todo un listado desde un archivo CSV.
                    </Typography>
                  </Box>
                </Stack>
                <Divider />
                <Typography variant="body2" color="text.secondary">
                  Archivo CSV con columnas <strong>correo;nombres;apellidos</strong>. También se acepta separado por comas.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap sx={{ alignItems: { sm: 'center' }, flexWrap: 'wrap' }}>
                  <Button component="label" variant="outlined" startIcon={<UploadFileOutlined />}>
                    Elegir CSV
                    <input hidden type="file" accept=".csv,text/csv" onChange={leerArchivo} />
                  </Button>
                  {nombreArchivo && (
                    <Typography variant="body2" color="text.secondary">
                      {nombreArchivo}: {filasCsv.length} filas listas
                    </Typography>
                  )}
                  <Button variant="contained" onClick={enviar} disabled={enviando || filasCsv.length === 0}>
                    {enviando ? 'Enviando…' : `Enviar ${filasCsv.length || ''} invitaciones`}
                  </Button>
                </Stack>
                <Button
                  variant="text"
                  startIcon={<DownloadOutlined />}
                  onClick={descargarPlantilla}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Descargar plantilla CSV
                </Button>
              </Stack>
            </Paper>
          </Stack>

          {aviso && <Alert severity="success" role="status">{aviso}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          <Paper variant="outlined" component="section" aria-labelledby="titulo-invitaciones">
            <Typography id="titulo-invitaciones" variant="body2" color="text.secondary" aria-live="polite" sx={{ p: 2 }}>
              {resumen.invitados} invitados · {resumen.registrados} registrados · {invitaciones.length} en total
            </Typography>
            {cargando ? (
              <Box sx={{ p: 3 }}><CargandoPagina mensaje="Cargando invitaciones..." /></Box>
            ) : invitaciones.length === 0 ? (
              <Typography color="text.secondary" sx={{ px: 2, pb: 2 }}>
                Este grupo todavía no tiene invitaciones.
              </Typography>
            ) : (
              <TableContainer>
                <Table size="small" aria-label="Invitaciones del grupo">
                  <TableHead>
                    <TableRow>
                      <TableCell component="th" scope="col">Estudiante</TableCell>
                      <TableCell component="th" scope="col">Correo</TableCell>
                      <TableCell component="th" scope="col">Estado</TableCell>
                      <TableCell component="th" scope="col" align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invitaciones.map((invitacion) => {
                      const estado = ESTADO[invitacion.estado] ?? ESTADO.INVITADO;
                      return (
                        <TableRow key={invitacion.id}>
                          <TableCell component="th" scope="row">
                            {invitacion.apellidos}, {invitacion.nombres}
                          </TableCell>
                          <TableCell sx={{ overflowWrap: 'anywhere' }}>{invitacion.correo}</TableCell>
                          <TableCell>
                            <Chip size="small" variant="outlined" color={estado.color} label={estado.label} />
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              onClick={() => reenviar(invitacion)}
                              disabled={invitacion.estado === 'REGISTRADO'}
                              aria-label={`Reenviar invitación a ${invitacion.correo}`}
                            >
                              Reenviar
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </>
      )}
    </Stack>
  );
}
