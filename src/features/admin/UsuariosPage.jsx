/**
 * Administración de usuarios (SCRUM-45 / RF-13): buscar, filtrar por rol y estado,
 * crear con contraseña temporal, editar (incluido el rol) y activar o desactivar.
 */
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
import AddOutlined from '@mui/icons-material/AddOutlined';
import { cambiarEstado, listar } from '../../api/adminUsuariosApi';
import { mensajeDeError } from '../../api/errores';
import CargandoPagina from '../../components/CargandoPagina';
import { useAuth } from '../../context/AuthContext';
import { ETIQUETA_ROL, ROLES } from '../../routes/navegacion';
import UsuarioFormDialog from './UsuarioFormDialog';

const FILTROS_INICIALES = { buscar: '', rol: '', estado: '' };

export default function UsuariosPage() {
  const { user: sesion } = useAuth();
  const [parametros] = useSearchParams();
  // El panel del administrador enlaza aquí con ?rol=DOCENTE, por ejemplo.
  const [filtros, setFiltros] = useState(() => {
    const rol = parametros.get('rol');
    return { ...FILTROS_INICIALES, rol: Object.values(ROLES).includes(rol) ? rol : '' };
  });
  const [usuarios, setUsuarios] = useState(null);
  const [error, setError] = useState('');
  // undefined: cerrado · null: crear · objeto: editar
  const [formulario, setFormulario] = useState(undefined);
  const [porDesactivar, setPorDesactivar] = useState(null);
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    document.title = 'Usuarios · Aprendizaje USCO';
  }, []);

  const cargar = useCallback(async () => {
    try {
      setUsuarios(await listar(filtros));
      setError('');
    } catch (e) {
      setError(mensajeDeError(e, 'No pudimos cargar los usuarios.'));
    }
  }, [filtros]);

  useEffect(() => {
    // cargar solo cambia el estado después de la respuesta HTTP.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
  }, [cargar]);

  const cambiarFiltro = (campo) => (evento) =>
    setFiltros((anteriores) => ({ ...anteriores, [campo]: evento.target.value }));

  const aplicarEstado = async (usuario, estado) => {
    try {
      await cambiarEstado(usuario.id, estado);
      setAviso(`${usuario.nombres} ${usuario.apellidos} quedó ${estado === 'ACTIVO' ? 'activo' : 'inactivo'}.`);
      setPorDesactivar(null);
      cargar();
    } catch (e) {
      setPorDesactivar(null);
      setError(mensajeDeError(e, 'No pudimos cambiar el estado del usuario.'));
    }
  };

  const alGuardar = () => {
    setFormulario(undefined);
    setAviso('Los cambios quedaron guardados.');
    cargar();
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 1100 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h1">
          Usuarios
        </Typography>
        <Button variant="contained" startIcon={<AddOutlined />} onClick={() => setFormulario(null)}>
          Nuevo usuario
        </Button>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <TextField
          label="Buscar por nombre o correo"
          value={filtros.buscar}
          onChange={cambiarFiltro('buscar')}
          sx={{ flex: '2 1 240px' }}
        />
        <TextField
          select
          label="Rol"
          value={filtros.rol}
          onChange={cambiarFiltro('rol')}
          slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
          sx={{ flex: '1 1 170px' }}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.values(ROLES).map((rol) => (
            <MenuItem key={rol} value={rol}>
              {ETIQUETA_ROL[rol]}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Estado"
          value={filtros.estado}
          onChange={cambiarFiltro('estado')}
          slotProps={{ inputLabel: { shrink: true }, select: { displayEmpty: true } }}
          sx={{ flex: '1 1 170px' }}
        >
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="ACTIVO">Activo</MenuItem>
          <MenuItem value="INACTIVO">Inactivo</MenuItem>
        </TextField>
      </Stack>

      {aviso && (
        <Alert severity="success" role="status" onClose={() => setAviso('')}>
          {aviso}
        </Alert>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {!usuarios && !error && <CargandoPagina />}

      {usuarios && (
        <Paper variant="outlined" component="section" aria-labelledby="titulo-tabla-usuarios">
          <Typography id="titulo-tabla-usuarios" variant="body2" color="text.secondary" aria-live="polite" sx={{ p: 2 }}>
            {usuarios.length === 0
              ? 'No hay usuarios con estos filtros.'
              : `${usuarios.length} ${usuarios.length === 1 ? 'usuario' : 'usuarios'}`}
          </Typography>
          {usuarios.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell component="th" scope="col">Nombre</TableCell>
                    <TableCell component="th" scope="col">Correo</TableCell>
                    <TableCell component="th" scope="col">Rol</TableCell>
                    <TableCell component="th" scope="col">Estado</TableCell>
                    <TableCell component="th" scope="col" align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usuarios.map((u) => {
                    const nombre = `${u.nombres} ${u.apellidos}`;
                    const activo = u.estado === 'ACTIVO';
                    const esUnoMismo = u.id === sesion?.id;
                    return (
                      <TableRow key={u.id}>
                        <TableCell component="th" scope="row">
                          {nombre}
                          {u.programaAcademico && (
                            <Typography variant="body2" color="text.secondary">
                              {u.programaAcademico}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ overflowWrap: 'anywhere' }}>{u.correo}</TableCell>
                        <TableCell>{ETIQUETA_ROL[u.rol]}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            variant="outlined"
                            color={activo ? 'success' : 'default'}
                            label={activo ? 'Activo' : 'Inactivo'}
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          <Button size="small" onClick={() => setFormulario(u)} aria-label={`Editar a ${nombre}`}>
                            Editar
                          </Button>
                          {activo ? (
                            <Button
                              size="small"
                              color="error"
                              disabled={esUnoMismo}
                              title={esUnoMismo ? 'No puedes desactivar tu propia cuenta' : undefined}
                              onClick={() => setPorDesactivar(u)}
                              aria-label={`Desactivar a ${nombre}`}
                            >
                              Desactivar
                            </Button>
                          ) : (
                            <Button size="small" onClick={() => aplicarEstado(u, 'ACTIVO')} aria-label={`Activar a ${nombre}`}>
                              Activar
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      {formulario !== undefined && (
        <UsuarioFormDialog
          usuario={formulario}
          esUnoMismo={formulario?.id === sesion?.id}
          onCerrar={() => setFormulario(undefined)}
          onGuardado={alGuardar}
        />
      )}

      <Dialog open={Boolean(porDesactivar)} onClose={() => setPorDesactivar(null)} aria-labelledby="titulo-desactivar">
        <DialogTitle id="titulo-desactivar">¿Desactivar este usuario?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {porDesactivar && `${porDesactivar.nombres} ${porDesactivar.apellidos}`} no podrá iniciar sesión hasta que
            lo actives de nuevo. Sus datos se conservan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={() => setPorDesactivar(null)}>
            Cancelar
          </Button>
          <Button variant="contained" color="error" onClick={() => aplicarEstado(porDesactivar, 'INACTIVO')}>
            Sí, desactivar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
