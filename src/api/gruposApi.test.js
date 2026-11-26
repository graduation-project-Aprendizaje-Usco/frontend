import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './client';
import { crear, inscribir, listar } from './gruposApi';

vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('gruposApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lista los grupos del docente', async () => {
    api.get.mockResolvedValue({ data: [{ id: 1 }] });
    await expect(listar()).resolves.toEqual([{ id: 1 }]);
    expect(api.get).toHaveBeenCalledWith('/grupos');
  });

  it('crea un grupo', async () => {
    const grupo = { codigo: 'CALCULO-1', nombre: 'Cálculo' };
    api.post.mockResolvedValue({ data: { id: 1, ...grupo } });
    await expect(crear(grupo)).resolves.toEqual({ id: 1, ...grupo });
    expect(api.post).toHaveBeenCalledWith('/grupos', grupo);
  });

  it('inscribe un estudiante por correo', async () => {
    api.post.mockResolvedValue({ data: { id: 2 } });
    await expect(inscribir(1, 'ana@usco.edu.co')).resolves.toEqual({ id: 2 });
    expect(api.post).toHaveBeenCalledWith('/grupos/1/estudiantes', { correo: 'ana@usco.edu.co' });
  });
});
