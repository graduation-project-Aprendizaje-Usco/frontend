import { useState } from 'react';
import { MenuItem, Stack, TextField } from '@mui/material';
import TablaContenidos from './TablaContenidos';
import { ASIGNATURAS, COMPETENCIAS } from './catalogos';

export default function ContenidosTab({ contenidos, onEditar, onCambiarEstado, onEliminar }) {
  const [filtros, setFiltros] = useState({ q: '', competencia: '', asignatura: '', activo: '' });
  const cambiar = (campo) => (evento) => setFiltros((previos) => ({ ...previos, [campo]: evento.target.value }));

  const filtrados = contenidos.filter((contenido) => {
    const texto = `${contenido.titulo} ${contenido.tema}`.toLowerCase();
    return (
      (!filtros.q || texto.includes(filtros.q.toLowerCase()))
      && (!filtros.competencia || contenido.competenciaCodigo === filtros.competencia)
      && (!filtros.asignatura || contenido.asignatura === filtros.asignatura)
      && (filtros.activo === '' || contenido.activo === (filtros.activo === 'true'))
    );
  });

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <TextField label="Buscar contenido" value={filtros.q} onChange={cambiar('q')} sx={{ flex: '1 1 220px' }} />
        <TextField select label="Competencia" value={filtros.competencia} onChange={cambiar('competencia')} sx={{ flex: '1 1 180px' }}>
          <MenuItem value="">Todas</MenuItem>
          {COMPETENCIAS.map((competencia) => <MenuItem key={competencia.valor} value={competencia.valor}>{competencia.etiqueta}</MenuItem>)}
        </TextField>
        <TextField select label="Asignatura" value={filtros.asignatura} onChange={cambiar('asignatura')} sx={{ flex: '1 1 180px' }}>
          <MenuItem value="">Todas</MenuItem>
          {ASIGNATURAS.map((asignatura) => <MenuItem key={asignatura.valor} value={asignatura.valor}>{asignatura.etiqueta}</MenuItem>)}
        </TextField>
        <TextField select label="Estado" value={filtros.activo} onChange={cambiar('activo')} sx={{ flex: '0 1 140px' }}>
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="true">Activos</MenuItem>
          <MenuItem value="false">Inactivos</MenuItem>
        </TextField>
      </Stack>
      <TablaContenidos
        contenidos={filtrados}
        onEditar={onEditar}
        onCambiarEstado={onCambiarEstado}
        onEliminar={onEliminar}
      />
    </Stack>
  );
}
