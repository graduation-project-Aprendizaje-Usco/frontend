import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from './client';
import * as contenidosApi from './contenidosApi';
import * as ejerciciosApi from './ejerciciosApi';

vi.mock('./client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('contenidosApi y ejerciciosApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('contenidos: lista, crea, actualiza, cambia estado y elimina', async () => {
    api.get.mockResolvedValue({ data: [{ id: 1 }] });
    api.post.mockResolvedValue({ data: { id: 1 } });
    api.put.mockResolvedValue({ data: { id: 1 } });
    api.patch.mockResolvedValue({ data: { id: 1, activo: false } });
    api.delete.mockResolvedValue({});

    await expect(contenidosApi.listar({ activo: true })).resolves.toEqual([{ id: 1 }]);
    await expect(contenidosApi.crear({ titulo: 'T' })).resolves.toEqual({ id: 1 });
    await expect(contenidosApi.actualizar(1, { titulo: 'T2' })).resolves.toEqual({ id: 1 });
    await expect(contenidosApi.cambiarEstado(1, false)).resolves.toEqual({ id: 1, activo: false });
    await expect(contenidosApi.eliminar(1)).resolves.toBeUndefined();

    expect(api.get).toHaveBeenCalledWith('/contenidos', { params: { activo: true } });
    expect(api.post).toHaveBeenCalledWith('/contenidos', { titulo: 'T' });
    expect(api.put).toHaveBeenCalledWith('/contenidos/1', { titulo: 'T2' });
    expect(api.patch).toHaveBeenCalledWith('/contenidos/1/estado', { activo: false });
    expect(api.delete).toHaveBeenCalledWith('/contenidos/1');
  });

  it('ejercicios: lista, crea, actualiza, cambia estado y elimina', async () => {
    api.get.mockResolvedValue({ data: [{ id: 2 }] });
    api.post.mockResolvedValue({ data: { id: 2 } });
    api.put.mockResolvedValue({ data: { id: 2 } });
    api.patch.mockResolvedValue({ data: { id: 2, activo: false } });
    api.delete.mockResolvedValue({});

    await expect(ejerciciosApi.listar({ contenidoId: 1 })).resolves.toEqual([{ id: 2 }]);
    await expect(ejerciciosApi.crear({ enunciado: 'E' })).resolves.toEqual({ id: 2 });
    await expect(ejerciciosApi.actualizar(2, { enunciado: 'E2' })).resolves.toEqual({ id: 2 });
    await expect(ejerciciosApi.cambiarEstado(2, false)).resolves.toEqual({ id: 2, activo: false });
    await expect(ejerciciosApi.eliminar(2)).resolves.toBeUndefined();

    expect(api.get).toHaveBeenCalledWith('/ejercicios', { params: { contenidoId: 1 } });
    expect(api.post).toHaveBeenCalledWith('/ejercicios', { enunciado: 'E' });
    expect(api.put).toHaveBeenCalledWith('/ejercicios/2', { enunciado: 'E2' });
    expect(api.patch).toHaveBeenCalledWith('/ejercicios/2/estado', { activo: false });
    expect(api.delete).toHaveBeenCalledWith('/ejercicios/2');
  });
});
