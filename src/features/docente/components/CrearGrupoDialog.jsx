import { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { crear } from '../../../api/gruposApi';
import { mensajeDeError } from '../../../api/errores';

export default function CrearGrupoDialog({ abierto, onCerrar, onCreado }) {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const limpiar = () => {
    setCodigo('');
    setNombre('');
    setError('');
    setEnviando(false);
  };

  const cerrar = () => {
    if (enviando) return;
    limpiar();
    onCerrar();
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    if (!codigo.trim() || !nombre.trim()) {
      setError('El código y el nombre son obligatorios.');
      return;
    }
    setEnviando(true);
    setError('');
    try {
      const grupo = await crear({ codigo: codigo.trim(), nombre: nombre.trim() });
      limpiar();
      onCreado(grupo);
    } catch (e) {
      setError(mensajeDeError(e, 'No pudimos crear el grupo.'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={abierto} onClose={cerrar} fullWidth maxWidth="sm">
      <form onSubmit={enviar}>
        <DialogTitle>Crear grupo</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Código"
              value={codigo}
              onChange={(evento) => setCodigo(evento.target.value)}
              helperText="Ej. CALCULO-2026-2-A"
              autoFocus
              required
              disabled={enviando}
            />
            <TextField
              label="Nombre"
              value={nombre}
              onChange={(evento) => setNombre(evento.target.value)}
              helperText="Ej. Cálculo Diferencial - Grupo A"
              required
              disabled={enviando}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrar} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={enviando}>
            {enviando ? 'Creando…' : 'Crear grupo'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
