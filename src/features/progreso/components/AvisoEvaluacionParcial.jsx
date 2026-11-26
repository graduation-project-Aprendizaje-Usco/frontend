import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const UMBRAL_INTENTOS_CONSOLIDACION = 3;

export default function AvisoEvaluacionParcial({ dimensiones = [] }) {
  // Una dimensión está pendiente si no tiene actividad o tiene menos de 3 intentos evaluados
  const pendientes = dimensiones.filter(
    (d) => d.sinActividad || (d.intentosEvaluados ?? 0) < UMBRAL_INTENTOS_CONSOLIDACION,
  );

  return (
    <Alert severity="info" sx={{ borderRadius: 2 }}>
      <AlertTitle sx={{ fontWeight: 700 }}>Evaluación general parcial</AlertTitle>
      <Typography variant="body2">
        Tu nivel y porcentaje general son preliminares porque aún no has completado suficientes intentos en todas las
        dimensiones del aprendizaje. Se requiere un mínimo de {UMBRAL_INTENTOS_CONSOLIDACION} intentos evaluados por
        dimensión para consolidar el resultado.
      </Typography>
      {pendientes.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Dimensiones pendientes de consolidación:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2.5, mt: 0.5 }}>
            {pendientes.map((d) => {
              const intentos = d.intentosEvaluados ?? 0;
              const falta = Math.max(0, UMBRAL_INTENTOS_CONSOLIDACION - intentos);
              const detalleIntentos = d.sinActividad || intentos === 0
                ? 'Sin actividad registrada (faltan 3 intentos)'
                : `${intentos} de ${UMBRAL_INTENTOS_CONSOLIDACION} intentos (${falta === 1 ? 'falta 1 intento' : `faltan ${falta} intentos`})`;

              return (
                <li key={d.competenciaId || d.codigo}>
                  <Typography variant="body2">
                    <strong>{d.nombre}</strong>: {detalleIntentos}
                  </Typography>
                </li>
              );
            })}
          </Box>
        </Box>
      )}
    </Alert>
  );
}
