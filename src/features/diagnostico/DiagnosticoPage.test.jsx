import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { actual, finalizar, iniciar, responder } from '../../api/diagnosticoApi';
import { renderConApp } from '../../test/utilidades';
import DiagnosticoPage from './DiagnosticoPage';

vi.mock('../../api/diagnosticoApi', () => ({
  actual: vi.fn(),
  iniciar: vi.fn(),
  responder: vi.fn(),
  finalizar: vi.fn(),
}));

const DIMENSION = { codigo: 'ALGEBRAICA', nombre: 'Competencia algebraica' };
const item = (id) => ({
  id,
  numero: id,
  enunciado: `Pregunta ${id}: si $x = ${id}$, ¿cuánto vale $2x$?`,
  imagen: null,
  imagenAlt: null,
  dimension: DIMENSION,
  opciones: [1, 2, 3, 4].map((n) => ({ id: id * 10 + n, letra: 'ABCD'[n - 1], texto: `$${n * id}$` })),
});

/** Intento EN_CURSO de 3 ítems; el ítem 1 ya está respondido. */
const enCurso = (cambios = {}) => ({
  id: 7,
  estado: 'EN_CURSO',
  segundosRestantes: 2000,
  totalItems: 3,
  totalRespondidas: 1,
  respuestas: [{ itemId: 1, opcionId: 12 }],
  resultado: null,
  items: [item(1), item(2), item(3)],
  ...cambios,
});

const finalizado = {
  id: 7,
  estado: 'FINALIZADO',
  items: [],
  respuestas: [],
  resultado: { puntaje: 2, total: 3, categoriaDescripcion: 'Riesgo moderado' },
};

async function entrarALaPrueba(usuario) {
  await usuario.click(await screen.findByRole('button', { name: 'Continuar la prueba' }));
}

describe('DiagnosticoPage', () => {
  beforeEach(() => {
    actual.mockReset();
    iniciar.mockReset();
    responder.mockReset();
    finalizar.mockReset();
  });

  it('sin intento pide autorizar el tratamiento de datos antes de comenzar', async () => {
    actual.mockResolvedValue(null);
    iniciar.mockResolvedValue(enCurso({ respuestas: [], totalRespondidas: 0 }));
    const usuario = userEvent.setup();
    renderConApp(<DiagnosticoPage />);

    const comenzar = await screen.findByRole('button', { name: 'Comenzar la prueba' });
    expect(comenzar).toBeDisabled();
    await usuario.click(screen.getByLabelText(/Autorizo el tratamiento de mis datos/));
    await usuario.click(comenzar);

    expect(iniciar).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Ítem 1 de 3 · Competencia algebraica')).toBeInTheDocument();
  });

  it('con un intento EN_CURSO muestra "Continuar" y retoma en el primer ítem sin responder', async () => {
    actual.mockResolvedValue(enCurso());
    iniciar.mockResolvedValue(enCurso());
    const usuario = userEvent.setup();
    renderConApp(<DiagnosticoPage />);

    await entrarALaPrueba(usuario);

    expect(screen.getByText('Ítem 2 de 3 · Competencia algebraica')).toBeInTheDocument();
    expect(screen.getByText('1 de 3 respondidas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ítem 1, respondido' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ítem 2, sin responder' })).toHaveAttribute('aria-current', 'step');
  });

  it('guarda la respuesta al elegirla y lo anuncia', async () => {
    actual.mockResolvedValue(enCurso());
    iniciar.mockResolvedValue(enCurso());
    responder.mockResolvedValue({});
    const usuario = userEvent.setup();
    renderConApp(<DiagnosticoPage />);
    await entrarALaPrueba(usuario);

    // El grupo de opciones se etiqueta con el enunciado (lo anuncia el lector de pantalla).
    // Se revisa aria-labelledby a mano: jsdom no calcula nombres accesibles con el MathML de KaTeX.
    const opciones = screen.getByRole('radiogroup');
    expect(document.getElementById(opciones.getAttribute('aria-labelledby'))).toHaveTextContent('Pregunta 2');
    await usuario.click(within(opciones).getAllByRole('radio')[2]);

    expect(responder).toHaveBeenCalledWith(7, 2, 23);
    expect(await screen.findByText('Respuesta guardada')).toBeInTheDocument();
    expect(screen.getByText('2 de 3 respondidas')).toBeInTheDocument();
  });

  it('si falla el guardado permite reintentar', async () => {
    actual.mockResolvedValue(enCurso());
    iniciar.mockResolvedValue(enCurso());
    responder.mockRejectedValueOnce({ request: {} }).mockResolvedValueOnce({});
    const usuario = userEvent.setup();
    renderConApp(<DiagnosticoPage />);
    await entrarALaPrueba(usuario);

    await usuario.click(within(screen.getByRole('radiogroup')).getAllByRole('radio')[0]);
    await usuario.click(await screen.findByRole('button', { name: 'Reintentar' }));

    expect(responder).toHaveBeenCalledTimes(2);
    expect(responder).toHaveBeenLastCalledWith(7, 2, 21);
    expect(await screen.findByText('Respuesta guardada')).toBeInTheDocument();
  });

  it('finalizar pide confirmación y avisa cuántos ítems faltan', async () => {
    actual.mockResolvedValue(enCurso());
    iniciar.mockResolvedValue(enCurso());
    finalizar.mockResolvedValue(finalizado);
    const usuario = userEvent.setup();
    renderConApp(<DiagnosticoPage />);
    await entrarALaPrueba(usuario);

    // Búsquedas por texto: jsdom no calcula nombres accesibles con el MathML de KaTeX en la página.
    await usuario.click(screen.getByText('Finalizar la prueba'));
    expect(screen.getByText('¿Entregar la prueba?')).toBeInTheDocument();
    expect(screen.getByText(/Te faltan 2 ítems sin responder/)).toBeInTheDocument();

    // Un clic no basta: "Seguir respondiendo" cierra sin entregar.
    await usuario.click(screen.getByText('Seguir respondiendo'));
    expect(finalizar).not.toHaveBeenCalled();

    await usuario.click(screen.getByText('Finalizar la prueba'));
    await usuario.click(screen.getByText('Sí, entregar'));
    expect(finalizar).toHaveBeenCalledWith(7);
    expect(await screen.findByText('Puntaje: 2 de 3 · Riesgo moderado')).toBeInTheDocument();
  });

  it('al llegar el tiempo a 0 entrega la prueba sola', async () => {
    actual.mockResolvedValue(enCurso({ segundosRestantes: 1 }));
    iniciar.mockResolvedValue(enCurso({ segundosRestantes: 1 }));
    finalizar.mockResolvedValue(finalizado);
    const usuario = userEvent.setup();
    renderConApp(<DiagnosticoPage />);
    await entrarALaPrueba(usuario);

    await waitFor(() => expect(finalizar).toHaveBeenCalledWith(7), { timeout: 3000 });
    expect(await screen.findByText('Puntaje: 2 de 3 · Riesgo moderado')).toBeInTheDocument();
  });

  it('un intento FINALIZADO muestra el resultado y no deja volver a presentarla', async () => {
    actual.mockResolvedValue(finalizado);
    renderConApp(<DiagnosticoPage />);

    expect(await screen.findByText('Puntaje: 2 de 3 · Riesgo moderado')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Comenzar|Continuar/ })).not.toBeInTheDocument();
  });
});
