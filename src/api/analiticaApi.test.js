import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './client';
import { obtenerDetalleEstudiante, obtenerResumenGrupo } from './analiticaApi';

vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('analiticaApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta el resumen sin enviar filtros vacíos', async () => {
    api.get.mockResolvedValue({ data: { grupo: { id: 1 } } });
    await expect(
      obtenerResumenGrupo(1, { competencia: 'LOGICA', desde: '', hasta: '' }),
    ).resolves.toEqual({ grupo: { id: 1 } });
    expect(api.get).toHaveBeenCalledWith('/analitica/grupos/1', {
      params: { competencia: 'LOGICA' },
    });
  });

  it('consulta el detalle de un estudiante con sus filtros', async () => {
    api.get.mockResolvedValue({ data: { estudiante: { id: 11 } } });
    await expect(
      obtenerDetalleEstudiante(1, 11, { competencia: '', desde: '2026-08-01', hasta: '2026-08-31' }),
    ).resolves.toEqual({ estudiante: { id: 11 } });
    expect(api.get).toHaveBeenCalledWith('/analitica/grupos/1/estudiantes/11', {
      params: { desde: '2026-08-01', hasta: '2026-08-31' },
    });
  });
});
