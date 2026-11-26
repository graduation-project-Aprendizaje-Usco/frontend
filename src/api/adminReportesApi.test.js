import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './client';
import { obtenerReporteAdmin } from './adminReportesApi';

vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('adminReportesApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('envía solo los filtros de fecha definidos al endpoint administrativo', async () => {
    api.get.mockResolvedValue({ data: { practica: { intentos: 3 } } });

    await expect(
      obtenerReporteAdmin({ desde: '2026-08-01', hasta: '' }),
    ).resolves.toEqual({ practica: { intentos: 3 } });

    expect(api.get).toHaveBeenCalledWith('/admin/reportes', {
      params: { desde: '2026-08-01' },
    });
  });
});
