import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './client';
import { obtenerMiProgreso } from './progresoApi';

vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('progresoApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta el endpoint /progreso/me y devuelve los datos', async () => {
    const mockProgreso = {
      totalIntentos: 15,
      ejerciciosCompletados: 8,
      nivelGeneral: 'INTERMEDIO',
      porcentajeGeneral: 75.0,
      evaluacionParcial: false,
      dimensiones: [],
      tendenciaSemanal: [],
    };
    api.get.mockResolvedValue({ data: mockProgreso });

    const resultado = await obtenerMiProgreso();

    expect(api.get).toHaveBeenCalledWith('/progreso/me');
    expect(resultado).toEqual(mockProgreso);
  });

  it('propaga los errores HTTP para que el consumidor los maneje', async () => {
    const error = { response: { status: 500, data: { message: 'Error interno' } } };
    api.get.mockRejectedValue(error);

    await expect(obtenerMiProgreso()).rejects.toBe(error);
    expect(api.get).toHaveBeenCalledWith('/progreso/me');
  });
});

