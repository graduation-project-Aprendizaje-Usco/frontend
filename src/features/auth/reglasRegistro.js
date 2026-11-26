/**
 * Reglas del registro de estudiantes. Deben coincidir con el backend:
 *  - RegistroRequest.java (correo, contraseña)
 *  - ProgramaAcademico.java (lista cerrada de programas)
 * El backend es la fuente de verdad: si cambian allá, se cambian aquí.
 */

/** Correo institucional de estudiante: "u" + 11 dígitos + "@usco.edu.co". */
export const PATRON_CORREO_ESTUDIANTE = /^u\d{11}@usco\.edu\.co$/i;
export const MENSAJE_CORREO_ESTUDIANTE = 'Usa tu correo institucional de estudiante: u + 11 dígitos + @usco.edu.co';

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;
/** Al menos una letra (con tildes o ñ) y al menos un dígito. */
export const PATRON_PASSWORD = /^(?=.*\p{L})(?=.*\d).*$/u;
export const MENSAJE_PASSWORD = 'La contraseña debe tener al menos una letra y un número';

export const PROGRAMAS_ACADEMICOS = Object.freeze([
  'Ingeniería Agrícola',
  'Ingeniería Agroindustrial',
  'Ingeniería Civil',
  'Ingeniería de Petróleos',
  'Ingeniería de Software',
  'Ingeniería Electrónica',
  'Licenciatura en Matemáticas',
]);
