import { useState } from 'react';
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { inscribir } from '../../../api/gruposApi';
import { mensajeDeError } from '../../../api/errores';

export default function InscribirEstudianteDialog({ abierto, grupo, onCerrar, onInscrito }) {
  const [correo, setCorreo] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const limpiar = () => {
    setCorreo('');
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
    if (!correo.trim()) {
      setError('Escribe el correo del estudiante.');
      return;
    }
    setEnviando(true);
    setError('');
    try {
      await inscribir(grupo.id, correo.trim());
      limpiar();
      onInscrito();
    } catch (e) {
      setError(mensajeDeError(e, 'No pudimos inscribir al estudiante.'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={abierto} onClose={cerrar} fullWidth maxWidth="sm">
      <form onSubmit={enviar}>
        <DialogTitle>Inscribir estudiante</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              El estudiante debe estar registrado y el correo debe pertenecer a su cuenta.
            </Alert>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Correo del estudiante"
              type="email"
              value={correo}
              onChange={(evento) => setCorreo(evento.target.value)}
              placeholder="u20201234567@usco.edu.co"
              autoFocus
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
            {enviando ? 'Inscribiendo…' : 'Inscribir'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
