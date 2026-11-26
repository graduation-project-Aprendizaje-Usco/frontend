import { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PersonAddOutlined from '@mui/icons-material/PersonAddOutlined';
import SendOutlined from '@mui/icons-material/SendOutlined';
import { invitarEstudiante } from '../../../api/invitacionesApi';
import { mensajeDeError } from '../../../api/errores';

const PATRON_CORREO = /^u\d{11}@usco\.edu\.co$/i;
const DATOS_VACIOS = { correo: '', nombres: '', apellidos: '' };

export default function InvitarEstudianteCard({ grupoId, onInvitado }) {
  const [datos, setDatos] = useState(DATOS_VACIOS);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo) => (evento) => {
    setDatos((actual) => ({ ...actual, [campo]: evento.target.value }));
    setError('');
    setAviso('');
  };

  const enviar = async (evento) => {
    evento.preventDefault();
    const correo = datos.correo.trim();
    const nombres = datos.nombres.trim();
    const apellidos = datos.apellidos.trim();
    if (!correo || !nombres || !apellidos) {
      setError('Completa el correo, los nombres y los apellidos.');
      return;
    }
    if (!PATRON_CORREO.test(correo)) {
      setError('Usa el correo institucional: u + 11 dígitos + @usco.edu.co.');
      return;
    }
    setEnviando(true);
    setError('');
    setAviso('');
    try {
      const invitacion = await invitarEstudiante(grupoId, { correo, nombres, apellidos });
      setAviso(`Invitación enviada a ${invitacion.correo}.`);
      setDatos(DATOS_VACIOS);
      onInvitado?.();
    } catch (e) {
      setError(mensajeDeError(e, 'No pudimos enviar la invitación.'));
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ flex: 1, minWidth: 0, p: 2 }}>
      <Stack component="form" spacing={2} onSubmit={enviar} noValidate>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
            <PersonAddOutlined />
          </Avatar>
          <Box>
            <Typography variant="h6" component="h2">
              Invitación individual
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Envía el enlace de registro a un solo estudiante.
            </Typography>
          </Box>
        </Stack>

        <Divider />

        {aviso && <Alert severity="success" role="status">{aviso}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Correo institucional"
          type="email"
          value={datos.correo}
          onChange={cambiar('correo')}
          placeholder="u20201234567@usco.edu.co"
          helperText="Formato: u + 11 dígitos + @usco.edu.co"
          autoComplete="off"
          required
          disabled={enviando}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Nombres"
            value={datos.nombres}
            onChange={cambiar('nombres')}
            placeholder="Ana María"
            autoComplete="off"
            required
            disabled={enviando}
          />
          <TextField
            label="Apellidos"
            value={datos.apellidos}
            onChange={cambiar('apellidos')}
            placeholder="Pérez Gómez"
            autoComplete="off"
            required
            disabled={enviando}
          />
        </Stack>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SendOutlined />}
            disabled={enviando}
          >
            {enviando ? 'Enviando…' : 'Enviar invitación'}
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
}
