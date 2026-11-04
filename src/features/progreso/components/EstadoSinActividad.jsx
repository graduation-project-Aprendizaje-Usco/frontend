import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import SchoolOutlined from '@mui/icons-material/SchoolOutlined';
import PlayArrowOutlined from '@mui/icons-material/PlayArrowOutlined';
import { useNavigate } from 'react-router';

export default function EstadoSinActividad() {
  const navigate = useNavigate();

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 3, sm: 5 },
        textAlign: 'center',
        borderRadius: 2,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 640,
        mx: 'auto',
        my: 4,
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          bgcolor: 'action.hover',
          color: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <SchoolOutlined sx={{ fontSize: 36 }} aria-hidden="true" />
      </Box>

      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
        Aún no registras actividad evaluada
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 480 }}>
        Tu progreso académico se calculará y actualizará automáticamente a medida que completes sesiones de práctica o
        pruebas de diagnóstico. ¡Comienza ahora para descubrir tu nivel de dominio!
      </Typography>

      <Button
        variant="contained"
        size="large"
        startIcon={<PlayArrowOutlined />}
        onClick={() => navigate('/estudiante/practica')}
      >
        Ir a practicar
      </Button>
    </Paper>
  );
}

