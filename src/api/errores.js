/**
 * Convierte un error de las funciones de api/ en un texto para mostrar al usuario.
 *
 *  - Respuesta del backend: usa su "message" (formato estándar ErrorResponse).
 *  - Sin respuesta (backend apagado, sin internet): mensaje de conexión.
 *  - Cualquier otro caso: el mensaje por defecto.
 */
export function mensajeDeError(error, porDefecto = 'Ocurrió un error inesperado. Intenta de nuevo.') {
  const mensaje = error?.response?.data?.message;
  if (mensaje) return mensaje;
  if (error?.request && !error?.response) {
    return 'No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.';
  }
  return porDefecto;
}
