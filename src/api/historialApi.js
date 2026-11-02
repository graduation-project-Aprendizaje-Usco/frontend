/**
 * Cliente de GET /api/historial (SCRUM-41, README-backend).
 * Respuesta: { contenido: [...], pagina, tamano, totalElementos, totalPaginas }, 20 por página.
 * Cada fila trae tipo ('DIAGNOSTICO' | 'PRACTICA'), id, fecha, actividad, competenciaCodigo/Nombre y:
 *  - DIAGNOSTICO: aciertos, total, categoria;
 *  - PRACTICA: correcto, nivel, tiempoSeg, pistaUsada.
 */
import api from './client';

/**
 * @param {{ tipo?: string, competencia?: string, desde?: string, hasta?: string, page?: number, estudianteId?: number }} filtros
 *        Fechas en AAAA-MM-DD (ambas incluidas). estudianteId solo para el docente.
 */
export async function consultar(filtros = {}) {
  // Los filtros vacíos no se envían: el backend los toma como "sin filtro".
  const params = Object.fromEntries(
    Object.entries(filtros).filter(([, valor]) => valor !== '' && valor != null),
  );
  const { data } = await api.get('/historial', { params });
  return data;
}
