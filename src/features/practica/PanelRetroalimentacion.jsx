import { useEffect, useRef } from 'react';
import { Alert, Box, Typography } from '@mui/material';
import CheckCircleOutlineOutlined from '@mui/icons-material/CheckCircleOutlineOutlined';
import MathText from '../../components/MathText';

/**
 * Panel que muestra el resultado del intento y la retroalimentación que envía el
 * backend en la misma respuesta de POST /api/practica/intentos (RF-07).
 *
 * Primer fallo: pista + error común. Segundo fallo: explicación completa.
 * Acierto: explicación breve. El foco se mueve al panel para que un lector de
 * pantalla anuncie el resultado y el botón "Comprobar respuesta" no lo deje perdido.
 */
export default function PanelRetroalimentacion({ resultado }) {
  const panelRef = useRef(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, [resultado]);

  if (!resultado?.retroalimentacion) return null;

  const { esCorrecta, numeroIntento, retroalimentacion } = resultado;
  const esPista = retroalimentacion.tipo === 'PISTA';
  const etiqueta = esPista ? 'Pista' : 'Explicación';

  return (
    <Alert
      ref={panelRef}
      tabIndex={-1}
      severity={esCorrecta ? 'success' : 'error'}
      icon={esCorrecta ? <CheckCircleOutlineOutlined /> : undefined}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      sx={{ mt: 2, '&:focus': { outline: 'none' } }}
    >
      <Typography component="p" sx={{ fontWeight: 700 }}>
        {esCorrecta ? 'Respuesta correcta.' : 'Respuesta incorrecta.'}
      </Typography>

      {retroalimentacion.texto && (
        <Typography component="p" sx={{ mt: 0.5 }}>
          <Box component="span" sx={{ fontWeight: 700 }}>
            {etiqueta}:{' '}
          </Box>
          <MathText texto={retroalimentacion.texto} />
        </Typography>
      )}

      {retroalimentacion.errorComun && (
        <MathText
          texto={`Error frecuente: ${retroalimentacion.errorComun}`}
          component="p"
          sx={{ mt: 0.5 }}
        />
      )}

      {!esCorrecta && numeroIntento >= 2 && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          Este fue el último intento para este ejercicio.
        </Typography>
      )}
    </Alert>
  );
}
