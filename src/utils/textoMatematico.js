/**
 * Separa un texto con notación matemática en partes de texto y de fórmula.
 *
 *   "Si $f(x) = x^2$, halla $$f'(x)$$"
 *   → [ { tipo: 'texto',   valor: 'Si ' },
 *       { tipo: 'formula', valor: 'f(x) = x^2', bloque: false, original: '$f(x) = x^2$' },
 *       { tipo: 'texto',   valor: ', halla ' },
 *       { tipo: 'formula', valor: "f'(x)",      bloque: true,  original: "$$f'(x)$$" } ]
 *
 * Reglas:
 *  - $…$   fórmula en línea;  $$…$$ fórmula en bloque (centrada, en su propia línea).
 *  - \$    es un signo de pesos literal (no abre fórmula).
 *  - Un $ sin cierre se deja como texto: "cuesta $5" no rompe nada.
 */
export function separarTextoYFormulas(texto) {
  const partes = [];
  let textoPendiente = '';
  let i = 0;

  const guardarTexto = () => {
    if (textoPendiente) partes.push({ tipo: 'texto', valor: textoPendiente });
    textoPendiente = '';
  };

  while (i < texto.length) {
    if (texto[i] === '\\' && texto[i + 1] === '$') {
      textoPendiente += '$';
      i += 2;
      continue;
    }

    if (texto[i] === '$') {
      const delimitador = texto[i + 1] === '$' ? '$$' : '$';
      const inicio = i + delimitador.length;
      const fin = buscarCierre(texto, inicio, delimitador);

      if (fin > inicio) {
        guardarTexto();
        partes.push({
          tipo: 'formula',
          valor: texto.slice(inicio, fin),
          bloque: delimitador === '$$',
          original: texto.slice(i, fin + delimitador.length),
        });
        i = fin + delimitador.length;
      } else {
        textoPendiente += delimitador;
        i = inicio;
      }
      continue;
    }

    textoPendiente += texto[i];
    i += 1;
  }

  guardarTexto();
  return partes;
}

/** Posición del delimitador de cierre, saltando lo escapado con \ (ej. \$ dentro de la fórmula). */
function buscarCierre(texto, desde, delimitador) {
  for (let j = desde; j < texto.length; j += 1) {
    if (texto[j] === '\\') {
      j += 1;
    } else if (texto.startsWith(delimitador, j)) {
      return j;
    }
  }
  return -1;
}
