/**
 * Una pregunta del diagnóstico (SCRUM-136).
 * Accesible: el enunciado es la etiqueta del grupo de opciones (aria-labelledby), así el lector de
 * pantalla lo anuncia junto con cada opción; RadioGroup de MUI permite elegir con las flechas; el estado
 * del guardado se anuncia con aria-live.
 */
import { Alert, Box, Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Typography } from '@mui/material';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutlineOutlined';
import MathText from '../../components/MathText';

function EstadoGuardado({ estado, onReintentar }) {
  return (
    <Box aria-live="polite" sx={{ minHeight: 40 }}>
      {estado === 'guardando' && <Typography color="text.secondary">Guardando…</Typography>}
      {estado === 'guardado' && (
        <Typography color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CheckCircleOutline fontSize="small" aria-hidden="true" /> Respuesta guardada
        </Typography>
      )}
      {estado === 'error' && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={onReintentar}>
              Reintentar
            </Button>
          }
        >
          No pudimos guardar tu respuesta. Revisa tu conexión.
        </Alert>
      )}
    </Box>
  );
}

export default function ItemDiagnostico({ item, numero, total, opcionId, estado, onResponder, onReintentar }) {
  const idEnunciado = `enunciado-${item.id}`;

  return (
    <FormControl sx={{ width: '100%' }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Ítem {numero} de {total} · {item.dimension.nombre}
      </Typography>
      <FormLabel id={idEnunciado} sx={{ mb: 2, fontSize: '1.125rem', color: 'text.primary', '&.Mui-focused': { color: 'text.primary' } }}>
        <MathText texto={item.enunciado} />
      </FormLabel>
      {item.imagen && (
        <Box
          component="img"
          src={item.imagen}
          alt={item.imagenAlt}
          sx={{ display: 'block', maxWidth: '100%', maxHeight: 320, mb: 2 }}
        />
      )}
      <RadioGroup
        aria-labelledby={idEnunciado}
        value={opcionId == null ? '' : String(opcionId)}
        onChange={(evento) => onResponder(Number(evento.target.value))}
      >
        {item.opciones.map((opcion) => (
          <FormControlLabel
            key={opcion.id}
            value={String(opcion.id)}
            control={<Radio />}
            sx={{ alignItems: 'center', mb: 0.5 }}
            label={
              <span>
                <strong>{opcion.letra.toLowerCase()})</strong> <MathText texto={opcion.texto} />
              </span>
            }
          />
        ))}
      </RadioGroup>
      <EstadoGuardado estado={estado} onReintentar={onReintentar} />
    </FormControl>
  );
}
