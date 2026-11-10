import { useState } from 'react';
import { MenuItem, Stack, TextField } from '@mui/material';
import TablaEjercicios from './TablaEjercicios';
import { COMPETENCIAS, NIVELES, TIPOS } from './catalogos';

export default function EjerciciosTab({ ejercicios, contenidos, onEditar, onCambiarEstado, onEliminar }) {
  const [filtros, setFiltros] = useState({
    q: '', contenidoId: '', competencia: '', nivel: '', tipo: '', activo: '',
  });
  const cambiar = (campo) => (evento) => setFiltros((previos) => ({ ...previos, [campo]: evento.target.value }));

  const filtrados = ejercicios.filter((ejercicio) => {
    const texto = `${ejercicio.codigo} ${ejercicio.enunciado}`.toLowerCase();
    return (
      (!filtros.q || texto.includes(filtros.q.toLowerCase()))
      && (!filtros.contenidoId || String(ejercicio.contenidoId) === filtros.contenidoId)
      && (!filtros.competencia || ejercicio.competenciaCodigo === filtros.competencia)
      && (!filtros.nivel || String(ejercicio.nivel) === filtros.nivel)
      && (!filtros.tipo || ejercicio.tipo === filtros.tipo)
      && (filtros.activo === '' || ejercicio.activo === (filtros.activo === 'true'))
    );
  });

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <TextField label="Buscar ejercicio" value={filtros.q} onChange={cambiar('q')} sx={{ flex: '1 1 220px' }} />
        <TextField select label="Contenido" value={filtros.contenidoId} onChange={cambiar('contenidoId')} sx={{ flex: '1 1 200px' }}>
          <MenuItem value="">Todos</MenuItem>
          {contenidos.map((contenido) => <MenuItem key={contenido.id} value={String(contenido.id)}>{contenido.titulo}</MenuItem>)}
        </TextField>
        <TextField select label="Competencia" value={filtros.competencia} onChange={cambiar('competencia')} sx={{ flex: '1 1 170px' }}>
          <MenuItem value="">Todas</MenuItem>
          {COMPETENCIAS.map((competencia) => <MenuItem key={competencia.valor} value={competencia.valor}>{competencia.etiqueta}</MenuItem>)}
        </TextField>
        <TextField select label="Nivel" value={filtros.nivel} onChange={cambiar('nivel')} sx={{ flex: '0 1 140px' }}>
          <MenuItem value="">Todos</MenuItem>
          {NIVELES.map((nivel) => <MenuItem key={nivel.valor} value={String(nivel.valor)}>{nivel.etiqueta}</MenuItem>)}
        </TextField>
        <TextField select label="Tipo" value={filtros.tipo} onChange={cambiar('tipo')} sx={{ flex: '0 1 170px' }}>
          <MenuItem value="">Todos</MenuItem>
          {TIPOS.map((tipo) => <MenuItem key={tipo.valor} value={tipo.valor}>{tipo.etiqueta}</MenuItem>)}
        </TextField>
        <TextField select label="Estado" value={filtros.activo} onChange={cambiar('activo')} sx={{ flex: '0 1 130px' }}>
          <MenuItem value="">Todos</MenuItem>
          <MenuItem value="true">Activos</MenuItem>
          <MenuItem value="false">Inactivos</MenuItem>
        </TextField>
      </Stack>
      <TablaEjercicios
        ejercicios={filtrados}
        onEditar={onEditar}
        onCambiarEstado={onCambiarEstado}
        onEliminar={onEliminar}
      />
    </Stack>
  );
}
