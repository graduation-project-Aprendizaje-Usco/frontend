import { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { mensajeDeError } from '../../../api/errores';

export default function ConfirmarEliminacionDialog({ titulo, mensaje, onCerrar, onConfirmar, onDesactivar }) {
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [puedeDesactivar, setPuedeDesactivar] = useState(false);

  const confirmar = async () => {
    setEnviando(true);
    setError('');
    try {
      await onConfirmar();
      onCerrar();
    } catch (e) {
      setError(mensajeDeError(e, 'No pudimos eliminar el registro.'));
      if (e?.response?.status === 409 && onDesactivar) setPuedeDesactivar(true);
    } finally {
      setEnviando(false);
    }
  };

  const desactivar = async () => {
    setEnviando(true);
    setError('');
    try {
      await onDesactivar();
      onCerrar();
    } catch (e) {
      setError(mensajeDeError(e, 'No pudimos desactivar el registro.'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open onClose={enviando ? undefined : onCerrar} fullWidth maxWidth="xs">
      <DialogTitle>{titulo}</DialogTitle>
      <DialogContent>
        <Typography>{mensaje}</Typography>
        {error && <Alert severity="warning" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCerrar} disabled={enviando}>Cancelar</Button>
        {puedeDesactivar && (
          <Button variant="outlined" onClick={desactivar} disabled={enviando}>
            Desactivar en su lugar
          </Button>
        )}
        <Button color="error" variant="contained" onClick={confirmar} disabled={enviando || puedeDesactivar}>
          {enviando ? 'Eliminando…' : 'Eliminar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
