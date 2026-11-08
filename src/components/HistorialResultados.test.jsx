import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { consultar } from '../api/historialApi';
import { renderConApp } from '../test/utilidades';
import HistorialResultados from './HistorialResultados';

vi.mock('../api/historialApi', () => ({ consultar: vi.fn() }));

const diagnostico = {
  tipo: 'DIAGNOSTICO',
  id: 1,
  fecha: '2026-10-25T14:30:00Z',
  actividad: 'Prueba Diagnóstica de Competencias Matemáticas',
  aciertos: 16,
  total: 24,
  categoria: 'RIESGO_MODERADO',
};
const practica = {
  tipo: 'PRACTICA',
  id: 9,
  fecha: '2026-10-26T15:00:00Z',
  actividad: 'Factorización',
  competenciaCodigo: 'ALGEBRAICA',
  competenciaNombre: 'Competencia algebraica',
  correcto: false,
  nivel: 2,
  tiempoSeg: 48,
  pistaUsada: true,
};
const pagina = (contenido, cambios = {}) => ({
  contenido,
  pagina: 0,
  tamano: 20,
  totalElementos: contenido.length,
  totalPaginas: 1,
  ...cambios,
});

describe('HistorialResultados', () => {
  beforeEach(() => {
    consultar.mockReset();
  });

  it('muestra diagnósticos y prácticas con su resultado', async () => {
    consultar.mockResolvedValue(pagina([practica, diagnostico]));
    renderConApp(<HistorialResultados />);

    const filas = within(await screen.findByRole('table'))
      .getAllByRole('row')
      .slice(1);
    expect(filas).toHaveLength(2);
    expect(filas[0]).toHaveTextContent('Práctica');
    expect(filas[0]).toHaveTextContent('Factorización');
    expect(filas[0]).toHaveTextContent('Competencia algebraica');
    expect(filas[0]).toHaveTextContent('Incorrecto');
    expect(filas[0]).toHaveTextContent('Nivel 2 · 48 s · con pista');
    expect(filas[1]).toHaveTextContent('Diagnóstico');
    expect(filas[1]).toHaveTextContent('16 de 24 · Riesgo moderado');
    expect(screen.getByText('2 actividades')).toBeInTheDocument();
    expect(consultar).toHaveBeenCalledWith({
      tipo: '',
      competencia: '',
      desde: '',
      hasta: '',
      page: 0,
      estudianteId: undefined,
    });
  });

  it('al filtrar vuelve a consultar desde la primera página', async () => {
    consultar.mockResolvedValue(pagina([practica]));
    const usuario = userEvent.setup();
    renderConApp(<HistorialResultados />);
    await screen.findByRole('table');

    await usuario.click(screen.getByRole('combobox', { name: 'Actividad' }));
    await usuario.click(screen.getByRole('option', { name: 'Práctica' }));
    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-10-01' } });

    await waitFor(() =>
      expect(consultar).toHaveBeenLastCalledWith(
        expect.objectContaining({ tipo: 'PRACTICA', desde: '2026-10-01', page: 0 }),
      ),
    );
  });

  it('pagina de 20 en 20', async () => {
    const veinte = Array.from({ length: 20 }, (_, i) => ({ ...practica, id: i + 1 }));
    consultar.mockResolvedValueOnce(pagina(veinte, { totalElementos: 25, totalPaginas: 2 }));
    consultar.mockResolvedValueOnce(
      pagina(veinte.slice(0, 5), { pagina: 1, totalElementos: 25, totalPaginas: 2 }),
    );
    const usuario = userEvent.setup();
    renderConApp(<HistorialResultados />);

    expect(await screen.findByText('1–20 de 25')).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Página siguiente' }));

    expect(consultar).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 }));
    expect(await screen.findByText('21–25 de 25')).toBeInTheDocument();
  });

  it('sin actividades lo dice en vez de mostrar una tabla vacía', async () => {
    consultar.mockResolvedValue(pagina([]));
    renderConApp(<HistorialResultados />);

    expect(await screen.findByText('No hay actividades con estos filtros.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('el docente consulta el historial del estudiante indicado', async () => {
    consultar.mockResolvedValue(pagina([diagnostico]));
    renderConApp(<HistorialResultados estudianteId={42} />);

    await screen.findByRole('table');
    expect(consultar).toHaveBeenCalledWith(expect.objectContaining({ estudianteId: 42 }));
  });

  it('muestra el error del backend', async () => {
    consultar.mockRejectedValue({
      response: {
        status: 403,
        data: { message: 'El estudiante no pertenece a ninguno de tus grupos' },
      },
    });
    renderConApp(<HistorialResultados estudianteId={7} />);

    expect(
      await screen.findByText('El estudiante no pertenece a ninguno de tus grupos'),
    ).toBeInTheDocument();
  });
});
