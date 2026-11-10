import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  LinearProgress,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import AddOutlined from '@mui/icons-material/AddOutlined';
import RefreshOutlined from '@mui/icons-material/RefreshOutlined';
import * as contenidosApi from '../../api/contenidosApi';
import * as ejerciciosApi from '../../api/ejerciciosApi';
import { mensajeDeError } from '../../api/errores';
import ContenidosTab from './actividades/ContenidosTab';
import EjerciciosTab from './actividades/EjerciciosTab';
import ContenidoFormDialog from './actividades/ContenidoFormDialog';
import EjercicioFormDialog from './actividades/EjercicioFormDialog';
import ConfirmarEliminacionDialog from './actividades/ConfirmarEliminacionDialog';

export default function ActividadesPage() {
  const [tab, setTab] = useState(0);
  const [contenidos, setContenidos] = useState([]);
  const [ejercicios, setEjercicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [contenidoFormulario, setContenidoFormulario] = useState(undefined);
  const [ejercicioFormulario, setEjercicioFormulario] = useState(undefined);
  const [eliminar, setEliminar] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [listaContenidos, listaEjercicios] = await Promise.all([
        contenidosApi.listar(),
        ejerciciosApi.listar(),
      ]);
      setContenidos(listaContenidos);
      setEjercicios(listaEjercicios);
    } catch (e) {
      setError(mensajeDeError(e, 'No pudimos cargar tus actividades.'));
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Actividades · Aprendizaje USCO';
    // cargar cambia el estado solo después de la respuesta HTTP.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargar();
  }, [cargar]);

  const guardar = async () => {
    setContenidoFormulario(undefined);
    setEjercicioFormulario(undefined);
    await cargar();
  };

  const cambiarEstadoContenido = async (contenido) => {
    try {
      await contenidosApi.cambiarEstado(contenido.id, !contenido.activo);
      await cargar();
    } catch (e) {
      setError(mensajeDeError(e, 'No pudimos cambiar el estado del contenido.'));
    }
  };

  const cambiarEstadoEjercicio = async (ejercicio) => {
    try {
      await ejerciciosApi.cambiarEstado(ejercicio.id, !ejercicio.activo);
      await cargar();
    } catch (e) {
      setError(mensajeDeError(e, 'No pudimos cambiar el estado del ejercicio.'));
    }
  };

  const confirmarEliminar = async () => {
    if (eliminar.tipo === 'contenido') {
      await contenidosApi.eliminar(eliminar.item.id);
    } else {
      await ejerciciosApi.eliminar(eliminar.item.id);
    }
    await cargar();
  };

  const desactivarEnLugar = async () => {
    if (eliminar.tipo === 'contenido') {
      await contenidosApi.cambiarEstado(eliminar.item.id, false);
    } else {
      await ejerciciosApi.cambiarEstado(eliminar.item.id, false);
    }
    await cargar();
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 1200, mx: 'auto', pb: 4 }}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Actividades y contenidos
        </Typography>
        <Typography color="text.secondary">
          Administra los contenidos y ejercicios de práctica de tus estudiantes.
        </Typography>
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
        <Tabs value={tab} onChange={(_evento, valor) => setTab(valor)} aria-label="Secciones de actividades">
          <Tab label="Ejercicios" />
          <Tab label="Contenidos" />
        </Tabs>
        <Stack direction="row" spacing={1}>
          <Button variant="text" startIcon={<RefreshOutlined />} onClick={cargar} disabled={cargando}>
            Actualizar
          </Button>
          {tab === 0 ? (
            <Button
              variant="contained"
              startIcon={<AddOutlined />}
              onClick={() => setEjercicioFormulario(null)}
              disabled={contenidos.length === 0}
            >
              Nuevo ejercicio
            </Button>
          ) : (
            <Button variant="contained" startIcon={<AddOutlined />} onClick={() => setContenidoFormulario(null)}>
              Nuevo contenido
            </Button>
          )}
        </Stack>
      </Stack>

      {cargando && (
        <Box role="status" aria-live="polite">
          <Typography sx={{ mb: 1 }}>Cargando actividades…</Typography>
          <LinearProgress />
        </Box>
      )}

      {error && (
        <Alert
          severity="error"
          action={<Button color="inherit" size="small" onClick={cargar}>Reintentar</Button>}
        >
          {error}
        </Alert>
      )}

      {!cargando && tab === 0 && contenidos.length === 0 && (
        <Alert severity="info">
          Primero crea un contenido en la pestaña “Contenidos” para poder agregar ejercicios.
        </Alert>
      )}

      {!cargando && tab === 0 && (
        <EjerciciosTab
          ejercicios={ejercicios}
          contenidos={contenidos}
          onEditar={setEjercicioFormulario}
          onCambiarEstado={cambiarEstadoEjercicio}
          onEliminar={(item) => setEliminar({ tipo: 'ejercicio', item })}
        />
      )}

      {!cargando && tab === 1 && (
        <ContenidosTab
          contenidos={contenidos}
          onEditar={setContenidoFormulario}
          onCambiarEstado={cambiarEstadoContenido}
          onEliminar={(item) => setEliminar({ tipo: 'contenido', item })}
        />
      )}

      {contenidoFormulario !== undefined && (
        <ContenidoFormDialog
          key={contenidoFormulario?.id ?? 'nuevo-contenido'}
          contenido={contenidoFormulario}
          onCerrar={() => setContenidoFormulario(undefined)}
          onGuardado={guardar}
        />
      )}

      {ejercicioFormulario !== undefined && (
        <EjercicioFormDialog
          key={ejercicioFormulario?.id ?? 'nuevo-ejercicio'}
          ejercicio={ejercicioFormulario}
          contenidos={contenidos}
          onCerrar={() => setEjercicioFormulario(undefined)}
          onGuardado={guardar}
        />
      )}

      {eliminar && (
        <ConfirmarEliminacionDialog
          titulo={`Eliminar ${eliminar.tipo}`}
          mensaje={
            eliminar.tipo === 'ejercicio'
              ? `¿Seguro que quieres eliminar “${eliminar.item.codigo}”? Si tiene intentos, se ofrecerá desactivarlo.`
              : `¿Seguro que quieres eliminar “${eliminar.item.titulo}”? Si tiene ejercicios, se ofrecerá desactivarlo.`
          }
          onCerrar={() => setEliminar(null)}
          onConfirmar={confirmarEliminar}
          onDesactivar={desactivarEnLugar}
        />
      )}
    </Stack>
  );
}
