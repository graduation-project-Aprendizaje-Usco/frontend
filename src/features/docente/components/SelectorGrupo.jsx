import { Button, MenuItem, Stack, TextField } from '@mui/material';
import AddOutlined from '@mui/icons-material/AddOutlined';

export default function SelectorGrupo({ grupos, grupoId, onChange, onCrear, deshabilitado = false }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
      <TextField
        select
        label="Grupo"
        value={grupoId ?? ''}
        onChange={(evento) => onChange(evento.target.value)}
        disabled={deshabilitado}
        sx={{ minWidth: { xs: '100%', sm: 300 } }}
        slotProps={{ inputLabel: { shrink: true } }}
      >
        {grupos.map((grupo) => (
          <MenuItem key={grupo.id} value={grupo.id}>
            {grupo.codigo} — {grupo.nombre}
          </MenuItem>
        ))}
      </TextField>
      <Button variant="outlined" startIcon={<AddOutlined />} onClick={onCrear} disabled={deshabilitado}>
        Crear grupo
      </Button>
    </Stack>
  );
}
