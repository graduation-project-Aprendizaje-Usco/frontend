import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
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
  opciones: [1, 2, 3, 4].map((n) => ({
    id: id * 10 + n,
    letra: 'ABCD'[n - 1],
    texto: `$${n * id}$`,
  })),
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

const dimension = (codigo, nombre, aciertos, nivel, nivelDescripcion) => ({
  codigo,
  nombre,
  aciertos,
  total: 8,
  porcentaje: (aciertos / 8) * 100,
  nivel,
  nivelDescripcion,
});

const finalizado = {
  id: 7,
  estado: 'FINALIZADO',
  items: [],
  respuestas: [],
  resultado: {
    puntaje: 14,
    total: 24,
    categoria: 'RIESGO_MODERADO',
    categoriaDescripcion: 'Riesgo moderado',
    finalizadoPorTiempo: false,
    finalizadoEn: '2026-10-18T14:30:12Z',
    dimensiones: [
      dimension('ALGEBRAICA', 'Competencia algebraica', 3, 'BAJO', 'Nivel bajo (alto riesgo)'),
      dimension('LOGICA', 'Razonamiento lógico', 4, 'MEDIO', 'Nivel medio (riesgo moderado)'),
      dimension('FUNCIONAL', 'Comprensión funcional', 7, 'ALTO', 'Nivel alto (adecuado)'),
    ],
  },
};

const verResultado = () => screen.findByRole('heading', { name: 'Resultado de tu diagnóstico' });

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
    expect(screen.getByRole('button', { name: 'Ítem 2, sin responder' })).toHaveAttribute(
      'aria-current',
      'step',
    );
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
    expect(document.getElementById(opciones.getAttribute('aria-labelledby'))).toHaveTextContent(
      'Pregunta 2',
    );
    await usuario.click(within(opciones).getAllByRole('radio')[2]);

    expect(responder).toHaveBeenCalledWith(7, 2, 23);
    expect(await screen.findByText('Respuesta guardada')).toBeInTheDocument();
    expect(screen.getByText('2 de 3 respondidas')).toBeInTheDocument();
  });

  it('"Siguiente" sin responder avisa y ofrece saltar el ítem (PV-01)', async () => {
    actual.mockResolvedValue(enCurso());
    iniciar.mockResolvedValue(enCurso());
    responder.mockResolvedValue({});
    const usuario = userEvent.setup();
    renderConApp(<DiagnosticoPage />);
    await entrarALaPrueba(usuario);

    // Está en el ítem 2, sin responder: "Siguiente" no avanza y muestra el aviso.
    await usuario.click(screen.getByText('Siguiente'));
    expect(screen.getByText(/Selecciona una opción para continuar/)).toBeInTheDocument();
    expect(screen.getByText('Ítem 2 de 3 · Competencia algebraica')).toBeInTheDocument();

    // Al responder, el aviso desaparece y "Siguiente" ya avanza.
    await usuario.click(within(screen.getByRole('radiogroup')).getAllByRole('radio')[0]);
    expect(screen.queryByText(/Selecciona una opción para continuar/)).not.toBeInTheDocument();

    // En el ítem 3 sin responder (el último), "Saltar ítem" no aplica: se ofrece "Finalizar".
    await usuario.click(screen.getByText('Siguiente'));
    expect(screen.getByText('Ítem 3 de 3 · Competencia algebraica')).toBeInTheDocument();
  });

  it('"Saltar ítem" deja el ítem sin responder y avanza', async () => {
    actual.mockResolvedValue(
      enCurso({ items: [item(1), item(2), item(3), item(4)], totalItems: 4 }),
    );
    iniciar.mockResolvedValue(
      enCurso({ items: [item(1), item(2), item(3), item(4)], totalItems: 4 }),
    );
    const usuario = userEvent.setup();
    renderConApp(<DiagnosticoPage />);
    await entrarALaPrueba(usuario);

    await usuario.click(screen.getByText('Siguiente'));
    await usuario.click(screen.getByText('Saltar ítem'));

    expect(screen.getByText('Ítem 3 de 4 · Competencia algebraica')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ítem 2, sin responder' })).toBeInTheDocument();
    expect(responder).not.toHaveBeenCalled();
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
    expect(await verResultado()).toBeInTheDocument();
  });

  it('al llegar el tiempo a 0 entrega la prueba sola', async () => {
    actual.mockResolvedValue(enCurso({ segundosRestantes: 1 }));
    iniciar.mockResolvedValue(enCurso({ segundosRestantes: 1 }));
    finalizar.mockResolvedValue(finalizado);
    const usuario = userEvent.setup();
    renderConApp(<DiagnosticoPage />);
    await entrarALaPrueba(usuario);

    await waitFor(() => expect(finalizar).toHaveBeenCalledWith(7), { timeout: 3000 });
    expect(await verResultado()).toBeInTheDocument();
  });

  it('un intento FINALIZADO muestra el resultado y no deja volver a presentarla', async () => {
    actual.mockResolvedValue(finalizado);
    renderConApp(<DiagnosticoPage />);

    expect(await verResultado()).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Comenzar|Continuar/ })).not.toBeInTheDocument();
  });
});

describe('Resultado del diagnóstico (SCRUM-26)', () => {
  beforeEach(() => {
    actual.mockReset();
  });

  it('muestra puntaje, categoría con texto y la tabla con los datos del backend', async () => {
    actual.mockResolvedValue(finalizado);
    renderConApp(<DiagnosticoPage />);
    await verResultado();

    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText(/\/ 24 correctas/)).toBeInTheDocument();
    expect(screen.getByText('Riesgo moderado')).toBeInTheDocument();

    const filas = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    expect(filas.map((fila) => fila.textContent)).toEqual([
      'Competencia algebraica3 de 838 %Nivel bajo (alto riesgo)',
      'Razonamiento lógico4 de 850 %Nivel medio (riesgo moderado)',
      'Comprensión funcional7 de 888 %Nivel alto (adecuado)',
    ]);
  });

  it('recomienda reforzar las dimensiones sin nivel alto y lleva a la práctica', async () => {
    actual.mockResolvedValue(finalizado);
    const usuario = userEvent.setup();
    renderConApp(
      <Routes>
        <Route path="/" element={<DiagnosticoPage />} />
        <Route path="/estudiante/practica" element={<p>Práctica</p>} />
      </Routes>,
    );
    await verResultado();

    const recomendaciones = screen.getByRole('heading', {
      name: 'Lo que vas a reforzar primero',
    }).parentElement;
    expect(recomendaciones).toHaveTextContent('Competencia algebraica');
    expect(recomendaciones).toHaveTextContent('Razonamiento lógico');
    expect(within(recomendaciones).getByRole('list')).not.toHaveTextContent(
      'Comprensión funcional',
    );

    await usuario.click(screen.getByRole('button', { name: 'Empezar a practicar' }));
    expect(await screen.findByText('Práctica')).toBeInTheDocument();
  });

  it('con todas las dimensiones en nivel alto felicita en vez de recomendar', async () => {
    const todasAltas = finalizado.resultado.dimensiones.map((d) => ({ ...d, nivel: 'ALTO' }));
    actual.mockResolvedValue({
      ...finalizado,
      resultado: { ...finalizado.resultado, dimensiones: todasAltas },
    });
    renderConApp(<DiagnosticoPage />);

    expect(
      await screen.findByRole('heading', { name: '¡Buen punto de partida!' }),
    ).toBeInTheDocument();
  });
});
