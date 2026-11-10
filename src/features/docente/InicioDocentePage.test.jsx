import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { obtenerDetalleEstudiante, obtenerResumenGrupo } from '../../api/analiticaApi';
import { crear, inscribir, listar } from '../../api/gruposApi';
import { renderConApp } from '../../test/utilidades';
import InicioDocentePage from './InicioDocentePage';

vi.mock('../../api/gruposApi', () => ({
  listar: vi.fn(),
  crear: vi.fn(),
  inscribir: vi.fn(),
}));

vi.mock('../../api/analiticaApi', () => ({
  obtenerResumenGrupo: vi.fn(),
  obtenerDetalleEstudiante: vi.fn(),
}));

vi.mock('../../api/historialApi', () => ({
  consultar: vi.fn().mockResolvedValue({
    contenido: [],
    pagina: 0,
    tamano: 20,
    totalElementos: 0,
    totalPaginas: 0,
  }),
}));

vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  };
});

const grupos = [{ id: 1, codigo: 'CALCULO-1', nombre: 'Cálculo Diferencial' }];

const resumen = {
  grupo: { id: 1, codigo: 'CALCULO-1', nombre: 'Cálculo Diferencial' },
  totalEstudiantes: 2,
  estudiantesConActividad: 2,
  promedioGeneral: 75,
  dimensiones: [
    {
      codigo: 'ALGEBRAICA',
      nombre: 'Competencia algebraica',
      promedio: 75,
      estudiantesEvaluados: 2,
      intentosEvaluados: 4,
      intentosCorrectos: 3,
    },
  ],
  dimensionMasDebil: {
    codigo: 'ALGEBRAICA',
    nombre: 'Competencia algebraica',
    promedio: 75,
    estudiantesEvaluados: 2,
    intentosEvaluados: 4,
    intentosCorrectos: 3,
  },
  topEjerciciosErrores: [
    {
      ejercicioId: 31,
      codigo: 'DIF-ALG-1-01',
      enunciado: 'Factoriza $x^2 + 2x$.',
      competenciaCodigo: 'ALGEBRAICA',
      competenciaNombre: 'Competencia algebraica',
      nivel: 1,
      intentos: 5,
      errores: 3,
      tasaError: 60,
    },
  ],
  evolucionGeneral: [
    {
      anio: 2026,
      semana: 33,
      fechaInicio: '2026-08-10',
      intentosEvaluados: 4,
      intentosCorrectos: 3,
      promedio: 75,
    },
  ],
  distribucionCategorias: [
    { categoria: 'ALTO_RIESGO', cantidad: 1, porcentaje: 50 },
    { categoria: 'RIESGO_MODERADO', cantidad: 0, porcentaje: 0 },
    { categoria: 'NIVEL_ADECUADO', cantidad: 1, porcentaje: 50 },
    { categoria: 'SIN_DIAGNOSTICO', cantidad: 0, porcentaje: 0 },
  ],
  estudiantesEnRiesgo: 1,
  estudiantes: [
    {
      id: 11,
      nombres: 'Ana',
      apellidos: 'Alvarez',
      correo: 'ana@usco.edu.co',
      intentos: 2,
      aciertos: 1,
      promedio: 50,
      nivel: 'BASICO',
      categoriaDiagnostico: 'ALTO_RIESGO',
      sinActividad: false,
      enRiesgo: true,
      motivosRiesgo: ['Diagnóstico en alto riesgo'],
    },
    {
      id: 12,
      nombres: 'Beto',
      apellidos: 'Bravo',
      correo: 'beto@usco.edu.co',
      intentos: 2,
      aciertos: 2,
      promedio: 100,
      nivel: 'AVANZADO',
      categoriaDiagnostico: 'NIVEL_ADECUADO',
      sinActividad: false,
      enRiesgo: false,
      motivosRiesgo: [],
    },
  ],
};

const detalle = {
  estudiante: resumen.estudiantes[0],
  dimensiones: [
    {
      codigo: 'ALGEBRAICA',
      nombre: 'Competencia algebraica',
      intentos: 2,
      aciertos: 1,
      promedio: 50,
      nivel: 'BASICO',
    },
  ],
  ultimoDiagnostico: {
    intentoId: 7,
    finalizadoEn: '2026-08-10T15:00:00Z',
    puntaje: 2,
    total: 24,
    categoria: 'ALTO_RIESGO',
    dimensiones: [
      {
        codigo: 'ALGEBRAICA',
        nombre: 'Competencia algebraica',
        intentos: 8,
        aciertos: 2,
        promedio: 25,
        nivel: 'BAJO',
      },
    ],
  },
};

async function esperarPanel() {
  await screen.findByRole('heading', { name: 'Desempeño de mis grupos' });
  await screen.findByText('Estudiantes del grupo');
}

describe('InicioDocentePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listar.mockResolvedValue(grupos);
    obtenerResumenGrupo.mockResolvedValue(resumen);
    obtenerDetalleEstudiante.mockResolvedValue(detalle);
  });

  it('muestra el resumen del grupo, la distribución y la tabla de estudiantes', async () => {
    renderConApp(<InicioDocentePage />, { ruta: '/docente?grupo=1' });

    await esperarPanel();

    expect(obtenerResumenGrupo).toHaveBeenCalledWith(1, {
      competencia: '',
      desde: '',
      hasta: '',
    });
    expect(screen.getByText('Promedio por dimensión')).toBeInTheDocument();
    expect(screen.getByText('Distribución de categorías')).toBeInTheDocument();
    expect(screen.getByText('Dimensión más débil')).toBeInTheDocument();
    expect(screen.getByText('Ejercicios con más errores')).toBeInTheDocument();
    expect(screen.getByText('Evolución general')).toBeInTheDocument();
    expect(screen.getByText('Estudiantes en riesgo')).toBeInTheDocument();
    expect(screen.getByText('Ana Alvarez')).toBeInTheDocument();
    expect(screen.getByText('Bravo, Beto')).toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Estudiantes del grupo' })).toBeInTheDocument();
  });

  it('abre el detalle del estudiante y reutiliza el historial', async () => {
    const usuario = userEvent.setup();
    renderConApp(<InicioDocentePage />, { ruta: '/docente?grupo=1' });

    await esperarPanel();
    await usuario.click(screen.getByRole('button', { name: 'Ver detalle de Ana Alvarez' }));

    expect(await screen.findByRole('heading', { name: 'Ana Alvarez' })).toBeInTheDocument();
    expect(obtenerDetalleEstudiante).toHaveBeenCalledWith(1, 11, {
      competencia: '',
      desde: '',
      hasta: '',
    });
    expect(await screen.findByText('Historial de resultados')).toBeInTheDocument();
  });

  it('actualiza los filtros y vuelve a consultar los indicadores', async () => {
    const usuario = userEvent.setup();
    renderConApp(<InicioDocentePage />, { ruta: '/docente?grupo=1' });

    await esperarPanel();
    await usuario.click(screen.getByRole('combobox', { name: 'Competencia' }));
    await usuario.click(screen.getByRole('option', { name: 'Razonamiento lógico' }));

    await waitFor(() =>
      expect(obtenerResumenGrupo).toHaveBeenLastCalledWith(
        1,
        expect.objectContaining({ competencia: 'LOGICA' }),
      ),
    );

    fireEvent.change(screen.getByLabelText('Periodo desde'), { target: { value: '2026-08-01' } });
    await waitFor(() =>
      expect(obtenerResumenGrupo).toHaveBeenLastCalledWith(
        1,
        expect.objectContaining({ competencia: 'LOGICA', desde: '2026-08-01' }),
      ),
    );
  });

  it('permite crear un grupo cuando el docente todavía no tiene', async () => {
    listar.mockResolvedValue([]);
    crear.mockResolvedValue({ id: 2, codigo: 'CALCULO-2', nombre: 'Cálculo Integral' });
    const usuario = userEvent.setup();
    renderConApp(<InicioDocentePage />, { ruta: '/docente' });

    expect(await screen.findByText('Aún no tienes grupos')).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Crear grupo' }));
    const dialogo = screen.getByRole('dialog');
    await usuario.type(within(dialogo).getByLabelText(/Código/), 'CALCULO-2');
    await usuario.type(within(dialogo).getByLabelText(/Nombre/), 'Cálculo Integral');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Crear grupo' }));

    await waitFor(() =>
      expect(crear).toHaveBeenCalledWith({ codigo: 'CALCULO-2', nombre: 'Cálculo Integral' }),
    );
    expect(await screen.findByText(/CALCULO-2/)).toBeInTheDocument();
  });

  it('permite inscribir un estudiante y recarga el resumen', async () => {
    inscribir.mockResolvedValue({ id: 13, nombres: 'Carla', apellidos: 'Castro' });
    const usuario = userEvent.setup();
    renderConApp(<InicioDocentePage />, { ruta: '/docente?grupo=1' });

    await esperarPanel();
    await usuario.click(screen.getByRole('button', { name: 'Inscribir estudiante' }));
    const dialogo = screen.getByRole('dialog');
    await usuario.type(within(dialogo).getByLabelText(/Correo del estudiante/), 'carla@usco.edu.co');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Inscribir' }));

    await waitFor(() => expect(inscribir).toHaveBeenCalledWith(1, 'carla@usco.edu.co'));
    await waitFor(() => expect(obtenerResumenGrupo).toHaveBeenCalledTimes(2));
  });

  it('muestra un error de carga con opción de reintentar', async () => {
    obtenerResumenGrupo.mockRejectedValueOnce({ response: { data: { message: 'Fallo simulado' } } });
    renderConApp(<InicioDocentePage />, { ruta: '/docente?grupo=1' });

    expect(await screen.findByText('Fallo simulado')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
});
