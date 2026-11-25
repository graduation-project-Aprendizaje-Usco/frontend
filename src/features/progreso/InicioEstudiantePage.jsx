import ProgresoPage from './ProgresoPage';

/**
 * Inicio del estudiante (SCRUM-140). El login lleva a /estudiante, así que esta
 * ruta muestra el mismo dashboard de progreso que /estudiante/progreso para no
 * cortar el flujo con una página "en construcción".
 */
export default function InicioEstudiantePage() {
  return <ProgresoPage />;
}
