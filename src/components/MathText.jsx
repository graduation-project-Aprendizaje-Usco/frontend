/**
 * Texto con notación matemática (SCRUM-160). Usar SIEMPRE para enunciados,
 * opciones, ejercicios y retroalimentación; nunca mostrar LaTeX como texto plano.
 *
 *   <MathText texto="Halla la derivada de $f(x) = \frac{x^2}{3}$" />
 *   <MathText texto="$$\lim_{x \to 0} \frac{\sin x}{x} = 1$$" component="p" />
 *
 * - $…$ en línea, $$…$$ en bloque, \$ para un signo de pesos (ver utils/textoMatematico.js).
 * - Si una fórmula está mal escrita se muestra su texto original y el resto sigue normal.
 * - Accesible: KaTeX genera MathML oculto que leen los lectores de pantalla; la
 *   versión visual (HTML) queda con aria-hidden.
 *
 * Ojo en JSX: dentro de comillas "…" la barra no se escapa ("\frac" funciona);
 * en un string de JavaScript ('…' o `…`) hay que escribir "\\frac".
 */
import { Fragment, useMemo } from 'react';
import katex from 'katex';
import { Box } from '@mui/material';
import { separarTextoYFormulas } from '../utils/textoMatematico';

function renderizar(formula) {
  try {
    return katex.renderToString(formula.valor, {
      displayMode: formula.bloque,
      output: 'htmlAndMathml',
      throwOnError: true,
      // No avisar en consola por tildes u otros caracteres Unicode dentro de \text{}.
      strict: false,
    });
  } catch (error) {
    if (import.meta.env.DEV) console.warn(`MathText: fórmula inválida ${formula.original}`, error.message);
    return null;
  }
}

export default function MathText({ texto = '', component = 'span', sx, ...props }) {
  const partes = useMemo(
    () =>
      separarTextoYFormulas(String(texto)).map((parte) =>
        parte.tipo === 'formula' ? { ...parte, html: renderizar(parte) } : parte,
      ),
    [texto],
  );

  return (
    <Box component={component} sx={sx} {...props}>
      {partes.map((parte, i) => {
        if (parte.tipo === 'texto' || parte.html === null) {
          return <Fragment key={i}>{parte.tipo === 'texto' ? parte.valor : parte.original}</Fragment>;
        }
        return (
          <Box
            key={i}
            component="span"
            // Las fórmulas en bloque largas se desplazan dentro de su caja en vez de romper el ancho (375 px).
            sx={parte.bloque ? { display: 'block', overflowX: 'auto', overflowY: 'hidden', py: 0.5 } : undefined}
            dangerouslySetInnerHTML={{ __html: parte.html }}
          />
        );
      })}
    </Box>
  );
}
