/**
 * Lleva los errores de validación del backend (400 con "errores": [{ campo, mensaje }])
 * a los campos de un formulario de react-hook-form.
 *
 * @returns {boolean} true si al menos un error quedó asignado a un campo del formulario.
 */
export function asignarErroresDeCampos(error, setError, camposDelFormulario) {
  const errores = error?.response?.data?.errores;
  if (!Array.isArray(errores)) return false;
  let asignado = false;
  for (const { campo, mensaje } of errores) {
    if (camposDelFormulario.includes(campo)) {
      setError(campo, { type: 'servidor', message: mensaje });
      asignado = true;
    }
  }
  return asignado;
}
