function escaparCsv(valor) {
  if (valor == null) return '';
  if (typeof valor === 'number') return String(valor);
  const texto = String(valor);
  const seguro = /^\s*[=+\-@]/.test(texto) ? `'${texto}` : texto;
  return `"${seguro.replaceAll('"', '""')}"`;
}

export function serializarCsvExcel(columnas, filas) {
  const lineas = [columnas, ...filas].map((fila) => fila.map(escaparCsv).join(';'));
  return `\uFEFF${lineas.join('\r\n')}`;
}

export function descargarCsvExcel(nombreArchivo, columnas, filas) {
  const archivo = new Blob([serializarCsvExcel(columnas, filas)], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement('a');
  enlace.href = url;
  const nombreSeguro = nombreArchivo.replace(/[^a-zA-Z0-9._-]+/g, '-');
  enlace.download = nombreSeguro.endsWith('.csv') ? nombreSeguro : `${nombreSeguro}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
