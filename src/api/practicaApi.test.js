import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './client';
import { responder, siguiente } from './practicaApi';

vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('practicaApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('consulta el siguiente ejercicio con la asignatura indicada', async () => {
    const ejercicio = { id: 12, tipo: 'OPCION_MULTIPLE' };
    api.get.mockResolvedValue({ data: ejercicio });

    await expect(siguiente('CALCULO_DIFERENCIAL')).resolves.toEqual(ejercicio);
    expect(api.get).toHaveBeenCalledWith('/practica/siguiente', {
      params: { asignatura: 'CALCULO_DIFERENCIAL' },
    });
  });

  it('registra el intento y devuelve el resultado del backend', async () => {
    const intento = {
      ejercicioId: 12,
      opcionId: 123,
      respuestaNumerica: null,
      tiempoSeg: 14,
      pistaUsada: false,
      claveIdempotencia: 'clave',
    };
    const resultado = { esCorrecta: true, numeroIntento: 1 };
    api.post.mockResolvedValue({ data: resultado });

    await expect(responder(intento)).resolves.toEqual(resultado);
    expect(api.post).toHaveBeenCalledWith('/practica/intentos', intento);
  });

  it('propaga el error HTTP sin convertirlo en un resultado', async () => {
    const error = { response: { status: 404 } };
    api.get.mockRejectedValue(error);

    await expect(siguiente('CALCULO_DIFERENCIAL')).rejects.toBe(error);
  });
});
