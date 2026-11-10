import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as contenidosApi from '../../api/contenidosApi';
import * as ejerciciosApi from '../../api/ejerciciosApi';
import { renderConApp } from '../../test/utilidades';
import ActividadesPage from './ActividadesPage';

vi.mock('../../api/contenidosApi', () => ({
  listar: vi.fn(),
  crear: vi.fn(),
  actualizar: vi.fn(),
  cambiarEstado: vi.fn(),
  eliminar: vi.fn(),
}));

vi.mock('../../api/ejerciciosApi', () => ({
  listar: vi.fn(),
  crear: vi.fn(),
  actualizar: vi.fn(),
  cambiarEstado: vi.fn(),
  eliminar: vi.fn(),
}));

const contenido = {
  id: 1,
  competenciaCodigo: 'ALGEBRAICA',
  competenciaNombre: 'Competencia algebraica',
  asignatura: 'CALCULO_DIFERENCIAL',
  tema: 'Álgebra',
  titulo: 'Contenido de prueba',
  descripcion: 'Descripción',
  activo: true,
  totalEjercicios: 1,
};

const ejercicio = {
  id: 31,
  codigo: 'DOC-TEST-1',
  contenidoId: 1,
  contenidoTitulo: 'Contenido de prueba',
  competenciaCodigo: 'ALGEBRAICA',
  competenciaNombre: 'Competencia algebraica',
  nivel: 1,
  tipo: 'OPCION_MULTIPLE',
  enunciado: 'Factoriza $x^2 + 2x$.',
  opciones: [
    { id: 1, letra: 'A', texto: '$x(x+2)$', correcta: true },
    { id: 2, letra: 'B', texto: '$x+2$', correcta: false },
    { id: 3, letra: 'C', texto: '$x^2$', correcta: false },
    { id: 4, letra: 'D', texto: '$2x$', correcta: false },
  ],
  respuestaNumerica: null,
  tolerancia: null,
  pista: 'Busca el factor común.',
  explicacion: 'Se extrae $x$.',
  errorComun: 'Olvidar el factor.',
  activo: true,
};

async function esperarPagina() {
  await screen.findByRole('heading', { name: 'Actividades y contenidos' });
  await waitFor(() => expect(screen.queryByText('Cargando actividades…')).not.toBeInTheDocument());
}

describe('ActividadesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    contenidosApi.listar.mockResolvedValue([contenido]);
    ejerciciosApi.listar.mockResolvedValue([ejercicio]);
    contenidosApi.crear.mockResolvedValue(contenido);
    ejerciciosApi.crear.mockResolvedValue(ejercicio);
    contenidosApi.actualizar.mockResolvedValue(contenido);
    ejerciciosApi.actualizar.mockResolvedValue(ejercicio);
    contenidosApi.cambiarEstado.mockResolvedValue(contenido);
    ejerciciosApi.cambiarEstado.mockResolvedValue(ejercicio);
    contenidosApi.eliminar.mockResolvedValue();
    ejerciciosApi.eliminar.mockResolvedValue();
  });

  it('muestra ejercicios y contenidos en sus pestañas', async () => {
    const usuario = userEvent.setup();
    renderConApp(<ActividadesPage />);

    await esperarPagina();
    expect(screen.getByText('DOC-TEST-1')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Ejercicios del docente' })).toBeInTheDocument();

    await usuario.click(screen.getByRole('tab', { name: 'Contenidos' }));
    expect(await screen.findByText('Contenido de prueba')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Contenidos del docente' })).toBeInTheDocument();
  });

  it('crea un contenido', async () => {
    contenidosApi.listar.mockResolvedValue([]);
    ejerciciosApi.listar.mockResolvedValue([]);
    const usuario = userEvent.setup();
    renderConApp(<ActividadesPage />);

    await esperarPagina();
    await usuario.click(screen.getByRole('tab', { name: 'Contenidos' }));
    await usuario.click(screen.getByRole('button', { name: 'Nuevo contenido' }));
    const dialogo = screen.getByRole('dialog');
    await usuario.type(within(dialogo).getByLabelText('Tema'), 'Álgebra');
    await usuario.type(within(dialogo).getByLabelText('Título'), 'Contenido nuevo');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(contenidosApi.crear).toHaveBeenCalledWith(
        expect.objectContaining({
          competencia: 'ALGEBRAICA',
          asignatura: 'CALCULO_DIFERENCIAL',
          tema: 'Álgebra',
          titulo: 'Contenido nuevo',
        }),
      ),
    );
  });

  it('crea un ejercicio de opción múltiple', async () => {
    ejerciciosApi.listar.mockResolvedValue([]);
    const usuario = userEvent.setup({ delay: null });
    renderConApp(<ActividadesPage />);

    await esperarPagina();
    await usuario.click(screen.getByRole('button', { name: 'Nuevo ejercicio' }));
    const dialogo = screen.getByRole('dialog');
    fireEvent.change(within(dialogo).getByLabelText('Enunciado'), { target: { value: 'Resuelve $x+1=2$.' } });
    fireEvent.change(within(dialogo).getByLabelText('Pista'), { target: { value: 'Despeja x.' } });
    fireEvent.change(within(dialogo).getByLabelText('Explicación'), { target: { value: 'Resta 1.' } });
    for (const letra of ['A', 'B', 'C', 'D']) {
      fireEvent.change(within(dialogo).getByLabelText(`Opción ${letra}`), {
        target: { value: `Respuesta ${letra}` },
      });
    }
    fireEvent.click(within(dialogo).getAllByLabelText('Correcta')[0]);
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(ejerciciosApi.crear).toHaveBeenCalledWith(
        expect.objectContaining({
          contenidoId: 1,
          tipo: 'OPCION_MULTIPLE',
          enunciado: 'Resuelve $x+1=2$.',
          opciones: expect.arrayContaining([
            expect.objectContaining({ letra: 'A', correcta: true }),
          ]),
        }),
      ),
    );
  });

  it('edita un ejercicio existente', async () => {
    const usuario = userEvent.setup();
    renderConApp(<ActividadesPage />);

    await esperarPagina();
    await usuario.click(screen.getByRole('button', { name: 'Editar' }));
    const dialogo = screen.getByRole('dialog');
    const enunciado = within(dialogo).getByLabelText('Enunciado');
    await usuario.clear(enunciado);
    await usuario.type(enunciado, 'Enunciado editado');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }));

    await waitFor(() =>
      expect(ejerciciosApi.actualizar).toHaveBeenCalledWith(
        31,
        expect.objectContaining({ enunciado: 'Enunciado editado' }),
      ),
    );
  });

  it('activa/desactiva y elimina con confirmación', async () => {
    const usuario = userEvent.setup();
    renderConApp(<ActividadesPage />);

    await esperarPagina();
    await usuario.click(screen.getByRole('button', { name: 'Desactivar' }));
    await waitFor(() => expect(ejerciciosApi.cambiarEstado).toHaveBeenCalledWith(31, false));

    await usuario.click(screen.getByRole('button', { name: 'Eliminar' }));
    const dialogo = screen.getByRole('dialog');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Eliminar' }));
    await waitFor(() => expect(ejerciciosApi.eliminar).toHaveBeenCalledWith(31));
  });

  it('si el ejercicio tiene intentos ofrece desactivarlo en lugar de eliminar', async () => {
    ejerciciosApi.eliminar.mockRejectedValueOnce({
      response: { status: 409, data: { message: 'El ejercicio tiene intentos; desactívalo' } },
    });
    const usuario = userEvent.setup();
    renderConApp(<ActividadesPage />);

    await esperarPagina();
    await usuario.click(screen.getByRole('button', { name: 'Eliminar' }));
    const dialogo = screen.getByRole('dialog');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Eliminar' }));

    expect(await screen.findByText(/desactívalo/)).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Desactivar en su lugar' }));
    await waitFor(() => expect(ejerciciosApi.cambiarEstado).toHaveBeenCalledWith(31, false));
  });
});
