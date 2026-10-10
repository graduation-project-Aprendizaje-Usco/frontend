/**
 * SOLO DESARROLLO (/dev/mathtext): catálogo para probar MathText a mano.
 * La ruta se registra únicamente con `npm run dev` (ver AppRouter.jsx); no existe en el build.
 */
import { useEffect, useState } from 'react';
import { Box, Chip, Container, Paper, Stack, TextField, Typography } from '@mui/material';
import MathText from '../../components/MathText';

const EJEMPLOS = [
  { grupo: 'Fracciones', texto: 'Simplifica $\\frac{x^2 - 1}{x - 1}$ para $x \\neq 1$.' },
  { grupo: 'Fracciones', texto: 'La pendiente es $m = \\dfrac{y_2 - y_1}{x_2 - x_1}$.' },
  { grupo: 'Potencias', texto: 'Si $f(x) = 3x^4 - 2x^{-1} + x^{\\frac{1}{2}}$, ¿cuánto vale $f(1)$?' },
  { grupo: 'Raíces', texto: 'Calcula $\\sqrt{16} + \\sqrt[3]{27} - \\sqrt{x^2 + 1}$.' },
  { grupo: 'Funciones', texto: 'Evalúa $\\sin\\left(\\frac{\\pi}{2}\\right) + \\cos(0) + \\ln(e) + \\log_{10}(100)$.' },
  { grupo: 'Funciones', texto: 'Dominio de $g(x) = \\dfrac{1}{\\sqrt{x - 2}}$ y de $h(x) = e^{-x}$.' },
  { grupo: 'Límites', texto: '$$\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$$' },
  { grupo: 'Derivadas', texto: "Si $y = x^3$, entonces $\\frac{dy}{dx} = 3x^2$ y $f'(x) = 3x^2$." },
  { grupo: 'Valor absoluto', texto: 'Resuelve $|2x - 3| < 5$ e intervalo $x \\in (-1, 4)$.' },
  { grupo: 'Bloque largo (375 px)', texto: '$$f(x) = \\frac{(x^2 + 3x - 4)(x^3 - 2x + 7)}{(x - 1)^2 (x + 4)} + \\sqrt{x^4 + 2x^2 + 1} - \\frac{\\ln(x^2 + 1)}{e^{x}}$$' },
  { grupo: 'Pesos literal', texto: 'Un cuaderno cuesta \\$5.000 y uno de cálculo $2 \\cdot 5$ mil.' },
  { grupo: 'Mal escrita', texto: 'Esta fórmula está rota: $\\frac{1}{$ y el resto del texto se ve normal.' },
  { grupo: 'Mal escrita', texto: 'Comando inexistente $\\fraccion{1}{2}$, seguida de una correcta $x^2$.' },
  { grupo: 'Sin cierre', texto: 'Un signo suelto como $5 no rompe nada.' },
];

export default function MathTextDemoPage() {
  const [propio, setPropio] = useState('Escribe aquí, por ejemplo: la derivada de $x^n$ es $n x^{n-1}$');

  useEffect(() => {
    document.title = 'MathText (desarrollo) · Aprendizaje USCO';
  }, []);

  return (
    <Container component="main" maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            MathText · página de prueba
          </Typography>
          <Typography color="text.secondary">
            Solo existe en desarrollo. Las fórmulas van entre <code>$…$</code> (en línea) o <code>$$…$$</code> (en
            bloque).
          </Typography>
        </Box>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={2}>
            <TextField
              id="mathtext-propio"
              label="Prueba tu propio texto"
              multiline
              minRows={2}
              value={propio}
              onChange={(evento) => setPropio(evento.target.value)}
            />
            <Typography component="h2" variant="subtitle2" color="text.secondary">
              Resultado
            </Typography>
            <MathText texto={propio} component="p" sx={{ m: 0, fontSize: '1.125rem' }} />
          </Stack>
        </Paper>

        <Stack spacing={1.5} component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
          {EJEMPLOS.map((ejemplo) => (
            <Paper key={ejemplo.texto} component="li" variant="outlined" sx={{ p: 2 }}>
              <Chip label={ejemplo.grupo} size="small" sx={{ mb: 1 }} />
              <MathText texto={ejemplo.texto} component="p" sx={{ m: 0, fontSize: '1.125rem' }} />
              <Typography
                component="code"
                variant="body2"
                color="text.secondary"
                sx={{ display: 'block', mt: 1, wordBreak: 'break-all' }}
              >
                {ejemplo.texto}
              </Typography>
            </Paper>
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}
