import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { responder, siguiente } from '../../api/practicaApi';
import { renderConApp } from '../../test/utilidades';
import PracticaPage from './PracticaPage';

vi.mock('../../api/practicaApi', () => ({
  responder: vi.fn(),
  siguiente: vi.fn(),
}));

const ejercicioOpcion = (cambios = {}) => ({
  id: 31,
  codigo: 'DIF-ALG-1-01',
  enunciado: 'Factoriza $x^2 + 2x$.',
  tipo: 'OPCION_MULTIPLE',
  nivel: 1,
  competencia: { codigo: 'ALGEBRAICA', nombre: 'Competencia algebraica' },
  opciones: [
    { id: 311, letra: 'A', texto: '$x(x + 2)$' },
    { id: 312, letra: 'B', texto: '$x + 2$' },
  ],
  pista: 'Busca el factor común.',
  ...cambios,
});

const resultadoIntento = (cambios = {}) => ({
  intentoId: 91,
  numeroIntento: 1,
  esCorrecta: true,
  puedeReintentar: false,
  retroalimentacion: { tipo: 'EXPLICACION', texto: 'Se extrae el factor común $x$.', errorComun: null },
  nivel: { competenciaCodigo: 'ALGEBRAICA', nivel: 2, rachaAciertos: 1, rachaErrores: 0 },
  ...cambios,
});

function elegirOpcion(id) {
  const radio = screen.getByRole('radiogroup').querySelector(`input[value="${id}"]`);
  return userEvent.click(radio);
}

async function esperarEjercicio() {
  await waitFor(() => expect(document.querySelector('h2')).toBeInTheDocument());
}

describe('PracticaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => '00000000-0000-4000-8000-000000000001') });
  });

  it('carga un ejercicio real, envía la opción y refleja el resultado y los indicadores confirmados', async () => {
    siguiente.mockResolvedValueOnce(ejercicioOpcion());
    responder.mockResolvedValueOnce(resultadoIntento());
    const usuario = userEvent.setup();
    renderConApp(<PracticaPage />);

    await esperarEjercicio();
    expect(screen.getByText('Competencia algebraica:')).toBeInTheDocument();
    await elegirOpcion(311);
    await usuario.click(screen.getByRole('button', { name: 'Comprobar respuesta' }));

    await screen.findByText('Respuesta correcta.');
    expect(responder).toHaveBeenCalledWith(
      expect.objectContaining({
        ejercicioId: 31,
        opcionId: 311,
        respuestaNumerica: null,
        pistaUsada: false,
        claveIdempotencia: '00000000-0000-4000-8000-000000000001',
      }),
    );
    const indicadorEjercicios = screen.getByText('Ejercicios resueltos').closest('.MuiCard-root');
    expect(within(indicadorEjercicios).getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Nivel actual por dimensión')).toBeInTheDocument();
    expect(screen.getByText('Intermedio')).toBeInTheDocument();
    expect(screen.getByText(/Se extrae el factor común/)).toBeInTheDocument();
  });

  it('muestra el feedback incorrecto del servidor, permite reintentar y carga el siguiente sin recargar', async () => {
    siguiente
      .mockResolvedValueOnce(ejercicioOpcion())
      .mockResolvedValueOnce(
        ejercicioOpcion({ id: 32, codigo: 'DIF-ALG-1-02', enunciado: 'Resuelve el nuevo ejercicio.' }),
      );
    responder
      .mockResolvedValueOnce(
        resultadoIntento({
          esCorrecta: false,
          puedeReintentar: true,
          retroalimentacion: { tipo: 'PISTA', texto: 'Revisa la factorización.', errorComun: 'Omitir el factor.' },
          nivel: { competenciaCodigo: 'ALGEBRAICA', nivel: 1, rachaAciertos: 0, rachaErrores: 1 },
        }),
      )
      .mockResolvedValueOnce(resultadoIntento({ numeroIntento: 2 }));
    const usuario = userEvent.setup();
    renderConApp(<PracticaPage />);

    await esperarEjercicio();
    await elegirOpcion(312);
    await usuario.click(screen.getByRole('button', { name: 'Comprobar respuesta' }));
    expect(await screen.findByText('Respuesta incorrecta.')).toBeInTheDocument();
    expect(screen.getByText(/Omitir el factor/)).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Intentar de nuevo' }));
    await elegirOpcion(311);
    await usuario.click(screen.getByRole('button', { name: 'Comprobar respuesta' }));
    await screen.findByText('Respuesta correcta.');
    await usuario.click(screen.getByRole('button', { name: 'Siguiente ejercicio' }));

    await waitFor(() =>
      expect(document.querySelector('h2')).toHaveTextContent('Resuelve el nuevo ejercicio.'),
    );
    expect(siguiente).toHaveBeenCalledTimes(2);
    expect(responder).toHaveBeenCalledTimes(2);
  });

  it('valida una entrada numérica y solo envía valores numéricos válidos', async () => {
    siguiente.mockResolvedValueOnce(
      ejercicioOpcion({
        tipo: 'NUMERICA',
        enunciado: 'Calcula el resultado.',
        opciones: [],
      }),
    );
    responder.mockResolvedValueOnce(resultadoIntento());
    const usuario = userEvent.setup();
    renderConApp(<PracticaPage />);

    await esperarEjercicio();
    const campo = screen.getByLabelText('Respuesta numérica');
    const comprobar = screen.getByRole('button', { name: 'Comprobar respuesta' });
    expect(comprobar).toBeDisabled();
    await usuario.type(campo, 'no es número');
    expect(comprobar).toBeDisabled();
    await usuario.clear(campo);
    await usuario.type(campo, '2,5');
    expect(comprobar).toBeEnabled();
    await usuario.click(comprobar);

    await screen.findByText('Respuesta correcta.');
    expect(responder).toHaveBeenCalledWith(
      expect.objectContaining({ opcionId: null, respuestaNumerica: 2.5 }),
    );
  });

  it('muestra carga y permite reintentar un error de red con la misma clave de idempotencia', async () => {
    let terminarCarga;
    siguiente.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          terminarCarga = resolve;
        }),
    );
    responder.mockRejectedValueOnce({ request: {} }).mockResolvedValueOnce(resultadoIntento());
    const usuario = userEvent.setup();
    renderConApp(<PracticaPage />);
    expect(screen.getByRole('status')).toHaveTextContent('Cargando ejercicio');
    await waitFor(() => expect(siguiente).toHaveBeenCalledTimes(1));
    terminarCarga(ejercicioOpcion());

    await esperarEjercicio();
    await elegirOpcion(311);
    await usuario.click(screen.getByRole('button', { name: 'Comprobar respuesta' }));
    expect(await screen.findByText(/No pudimos conectar/)).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Reintentar envío' }));
    await screen.findByText('Respuesta correcta.');
    expect(responder).toHaveBeenCalledTimes(2);
    expect(responder.mock.calls[0][0].claveIdempotencia).toBe(
      responder.mock.calls[1][0].claveIdempotencia,
    );
  });

  it('evita solicitudes duplicadas mientras el backend confirma el intento', async () => {
    siguiente.mockResolvedValueOnce(ejercicioOpcion());
    let confirmar;
    responder.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          confirmar = resolve;
        }),
    );
    const usuario = userEvent.setup();
    renderConApp(<PracticaPage />);
    await esperarEjercicio();
    await elegirOpcion(311);
    await usuario.click(screen.getByRole('button', { name: 'Comprobar respuesta' }));

    expect(screen.getByRole('button', { name: 'Enviando…' })).toBeDisabled();
    expect(responder).toHaveBeenCalledTimes(1);
    confirmar(resultadoIntento());
    await waitFor(() => expect(screen.getByText('Respuesta correcta.')).toBeInTheDocument());
  });

  it('permite seleccionar una opción con el teclado', async () => {
    siguiente.mockResolvedValueOnce(ejercicioOpcion());
    const usuario = userEvent.setup();
    renderConApp(<PracticaPage />);
    await esperarEjercicio();

    const primeraOpcion = screen.getByRole('radiogroup').querySelector('input[value="311"]');
    primeraOpcion.focus();
    await usuario.keyboard(' ');

    expect(primeraOpcion).toBeChecked();
  });

  it('trata un 404 al pedir el siguiente como fin de ejercicios, no como una respuesta incorrecta', async () => {
    siguiente.mockRejectedValueOnce({ response: { status: 404 } });
    renderConApp(<PracticaPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No hay ejercicios disponibles para practicar en este momento.',
    );
    expect(screen.queryByText('Respuesta incorrecta.')).not.toBeInTheDocument();
  });

  it('revela la pista del ejercicio y registra que fue usada en el intento', async () => {
    siguiente.mockResolvedValueOnce(ejercicioOpcion());
    responder.mockResolvedValueOnce(resultadoIntento());
    const usuario = userEvent.setup();
    renderConApp(<PracticaPage />);

    await esperarEjercicio();
    await usuario.click(screen.getByRole('button', { name: 'Pedir una pista' }));
    expect(screen.getByText('Busca el factor común.')).toBeInTheDocument();
    await elegirOpcion(311);
    await usuario.click(screen.getByRole('button', { name: 'Comprobar respuesta' }));

    await screen.findByText('Respuesta correcta.');
    expect(responder).toHaveBeenCalledWith(expect.objectContaining({ pistaUsada: true }));
  });
});
