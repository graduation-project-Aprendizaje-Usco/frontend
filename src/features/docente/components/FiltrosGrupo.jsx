import { Button, MenuItem, Stack, TextField } from '@mui/material';
import RestartAltOutlined from '@mui/icons-material/RestartAltOutlined';

const COMPETENCIAS = [
  { valor: '', etiqueta: 'Todas las dimensiones' },
  { valor: 'ALGEBRAICA', etiqueta: 'Algebraica' },
  { valor: 'LOGICA', etiqueta: 'Razonamiento lógico' },
  { valor: 'FUNCIONAL', etiqueta: 'Comprensión funcional' },
];

export default function FiltrosGrupo({ filtros, onCambiar, onLimpiar, deshabilitado = false }) {
  const hayFiltros = Boolean(filtros.competencia || filtros.desde || filtros.hasta);

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
      <TextField
        select
        label="Competencia"
        value={filtros.competencia}
        onChange={(evento) => onCambiar('competencia', evento.target.value)}
        disabled={deshabilitado}
        sx={{ flex: '1 1 210px' }}
        slotProps={{ inputLabel: { shrink: true } }}
      >
        {COMPETENCIAS.map((competencia) => (
          <MenuItem key={competencia.valor} value={competencia.valor}>
            {competencia.etiqueta}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        type="date"
        label="Periodo desde"
        value={filtros.desde}
        onChange={(evento) => onCambiar('desde', evento.target.value)}
        disabled={deshabilitado}
        sx={{ flex: '1 1 165px' }}
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <TextField
        type="date"
        label="Periodo hasta"
        value={filtros.hasta}
        onChange={(evento) => onCambiar('hasta', evento.target.value)}
        disabled={deshabilitado}
        sx={{ flex: '1 1 165px' }}
        slotProps={{ inputLabel: { shrink: true } }}
      />
      {hayFiltros && (
        <Button
          variant="text"
          startIcon={<RestartAltOutlined />}
          onClick={onLimpiar}
          disabled={deshabilitado}
        >
          Limpiar filtros
        </Button>
      )}
    </Stack>
  );
}
