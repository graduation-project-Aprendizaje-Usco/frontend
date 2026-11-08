import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProgresoPage from './ProgresoPage';
import { obtenerMiProgreso } from '../../api/progresoApi';
import { renderConApp } from '../../test/utilidades';

vi.mock('../../api/progresoApi', () => ({
  obtenerMiProgreso: vi.fn(),
}));

// Mock simple de Recharts para que no falle en entorno jsdom con ResponsiveContainer
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  };
});

describe('ProgresoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el estado de carga al inicio', () => {
    obtenerMiProgreso.mockReturnValue(new Promise(() => {})); // no resuelve inmediatamente
    renderConApp(<ProgresoPage />, { ruta: '/estudiante/progreso' });

    expect(screen.getByRole('status', { name: /cargando página/i })).toBeInTheDocument();
  });

  it('muestra estado neutral sin actividad si totalIntentos es 0 y sin diagnóstico', async () => {
    obtenerMiProgreso.mockResolvedValue({
      totalIntentos: 0,
      ejerciciosCompletados: 0,
      nivelGeneral: 'SIN_EVALUAR',
      porcentajeGeneral: null,
      evaluacionParcial: false,
      dimensiones: [
        {
          competenciaId: 1,
          codigo: 'DIM_1',
          nombre: 'Dimensión Álgebra',
          intentosEvaluados: 0,
          intentosCorrectos: 0,
          porcentajeAciertos: null,
          nivel: null,
          porcentajeDiagnostico: null,
          variacionPuntosPorcentuales: null,
          estadoVariacion: 'PRACTICA_PENDIENTE',
          sinActividad: true,
        },
      ],
      tendenciaSemanal: [],
    });

    renderConApp(<ProgresoPage />, { ruta: '/estudiante/progreso' });

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/aún no registras actividad evaluada/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ir a practicar/i })).toBeInTheDocument();
    // No debe mostrar un porcentaje 0% como resultado deficiente
    expect(screen.queryByText('0 %')).not.toBeInTheDocument();
  });

  it('muestra las dimensiones y aviso específico cuando tiene diagnóstico pero cero intentos de práctica', async () => {
    obtenerMiProgreso.mockResolvedValue({
      totalIntentos: 0,
      ejerciciosCompletados: 0,
      nivelGeneral: 'SIN_EVALUAR',
      porcentajeGeneral: null,
      evaluacionParcial: false,
      dimensiones: [
        {
          competenciaId: 1,
          codigo: 'DIM_1',
          nombre: 'Álgebra y Funciones',
          intentosEvaluados: 0,
          intentosCorrectos: 0,
          porcentajeAciertos: null,
          nivel: null,
          porcentajeDiagnostico: 75.0,
          variacionPuntosPorcentuales: null,
          estadoVariacion: 'PRACTICA_PENDIENTE',
          sinActividad: true,
        },
      ],
      tendenciaSemanal: [],
    });

    renderConApp(<ProgresoPage />, { ruta: '/estudiante/progreso' });

    await waitFor(() => {
      expect(screen.getByText(/diagnóstico inicial completado/i)).toBeInTheDocument();
    });

    // Muestra el botón de ir a practicar
    expect(screen.getByRole('button', { name: /comenzar práctica/i })).toBeInTheDocument();

    // No oculta la tabla de dimensiones
    expect(screen.getByText('Álgebra y Funciones')).toBeInTheDocument();
    expect(screen.getByText('75 %')).toBeInTheDocument();

    // El nivel general se visualiza como 'Pendiente de evaluación' y no como 'SIN_EVALUAR'
    expect(screen.getByText('Pendiente de evaluación')).toBeInTheDocument();
    expect(screen.queryByText('SIN_EVALUAR')).not.toBeInTheDocument();
  });

  it('muestra aviso cuando la evaluación es parcial detallando intentos faltantes (< 3)', async () => {
    obtenerMiProgreso.mockResolvedValue({
      totalIntentos: 7,
      ejerciciosCompletados: 4,
      nivelGeneral: 'BASICO',
      porcentajeGeneral: 55.0,
      evaluacionParcial: true,
      dimensiones: [
        {
          competenciaId: 1,
          codigo: 'DIM_1',
          nombre: 'Dimensión Algebraica',
          intentosEvaluados: 5,
          intentosCorrectos: 3,
          porcentajeAciertos: 60.0,
          nivel: 'INTERMEDIO',
          porcentajeDiagnostico: 50.0,
          variacionPuntosPorcentuales: 10.0,
          estadoVariacion: 'MEJORA',
          sinActividad: false,
        },
        {
          competenciaId: 2,
          codigo: 'DIM_2',
          nombre: 'Dimensión Lógica',
          intentosEvaluados: 2, // lleva 2 de 3
          intentosCorrectos: 1,
          porcentajeAciertos: 50.0,
          nivel: 'BASICO',
          porcentajeDiagnostico: 40.0,
          variacionPuntosPorcentuales: 10.0,
          estadoVariacion: 'MEJORA',
          sinActividad: false,
        },
        {
          competenciaId: 3,
          codigo: 'DIM_3',
          nombre: 'Dimensión Funcional',
          intentosEvaluados: 0,
          intentosCorrectos: 0,
          porcentajeAciertos: null,
          nivel: null,
          porcentajeDiagnostico: null,
          variacionPuntosPorcentuales: null,
          estadoVariacion: 'PRACTICA_PENDIENTE',
          sinActividad: true,
        },
      ],
      tendenciaSemanal: [],
    });

    renderConApp(<ProgresoPage />, { ruta: '/estudiante/progreso' });

    await waitFor(() => {
      expect(screen.getByText(/evaluación general parcial/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/dimensiones pendientes de consolidación:/i)).toBeInTheDocument();
    // Dimensión Lógica con 2 intentos debe aparecer en el banner indicando que le falta 1 intento
    expect(screen.getAllByText(/dimensión lógica/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/2 de 3 intentos \(falta 1 intento\)/i)).toBeInTheDocument();
    // Dimensión funcional sin actividad debe indicar que le faltan 3 intentos
    expect(screen.getAllByText(/dimensión funcional/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/sin actividad registrada \(faltan 3 intentos\)/i)).toBeInTheDocument();
    // Dimensión algebraica ya cumplió el umbral (5 >= 3), no debe estar en la lista de pendientes
    const pendientesList = screen.getByText(/dimensiones pendientes de consolidación:/i).parentElement;
    expect(pendientesList).not.toHaveTextContent('Dimensión Algebraica');
  });

  it('no muestra aviso de evaluación parcial cuando evaluacionParcial es false', async () => {
    obtenerMiProgreso.mockResolvedValue({
      totalIntentos: 15,
      ejerciciosCompletados: 10,
      nivelGeneral: 'AVANZADO',
      porcentajeGeneral: 85.0,
      evaluacionParcial: false,
      dimensiones: [
        {
          competenciaId: 1,
          codigo: 'DIM_1',
          nombre: 'Dimensión Algebraica',
          intentosEvaluados: 5,
          intentosCorrectos: 4,
          porcentajeAciertos: 80.0,
          nivel: 'AVANZADO',
          porcentajeDiagnostico: 70.0,
          variacionPuntosPorcentuales: 10.0,
          estadoVariacion: 'MEJORA',
          sinActividad: false,
        },
      ],
      tendenciaSemanal: [],
    });

    renderConApp(<ProgresoPage />, { ruta: '/estudiante/progreso' });

    await waitFor(() => {
      expect(screen.getByText('Mi progreso académico')).toBeInTheDocument();
    });

    expect(screen.queryByText(/evaluación general parcial/i)).not.toBeInTheDocument();
  });

  it('renderiza progreso completo y maneja porcentajes nulos y escala de niveles correctamente', async () => {
    obtenerMiProgreso.mockResolvedValue({
      totalIntentos: 20,
      ejerciciosCompletados: 12,
      nivelGeneral: 'INTERMEDIO',
      porcentajeGeneral: 60.0,
      evaluacionParcial: false,
      dimensiones: [
        {
          competenciaId: 1,
          codigo: 'DIM_1',
          nombre: 'Álgebra y Funciones',
          intentosEvaluados: 15,
          intentosCorrectos: 10,
          porcentajeAciertos: 66.7,
          nivel: 'INTERMEDIO',
          porcentajeDiagnostico: 60.0,
          variacionPuntosPorcentuales: 6.7,
          estadoVariacion: 'MEJORA',
          sinActividad: false,
        },
        {
          competenciaId: 2,
          codigo: 'DIM_2',
          nombre: 'Geometría y Medición',
          intentosEvaluados: 5,
          intentosCorrectos: 2,
          porcentajeAciertos: 40.0,
          nivel: 'BASICO',
          porcentajeDiagnostico: null,
          variacionPuntosPorcentuales: null,
          estadoVariacion: 'DIAGNOSTICO_PENDIENTE',
          sinActividad: false,
        },
      ],
      tendenciaSemanal: [
        {
          anio: 2026,
          semana: 42,
          fechaInicio: '2026-10-12',
          etiqueta: 'Sem 42',
          intentosEvaluados: 10,
          intentosCorrectos: 6,
          porcentajeAciertos: 60.0,
        },
        {
          anio: 2026,
          semana: 43,
          fechaInicio: '2026-10-19',
          etiqueta: 'Sem 43',
          intentosEvaluados: 10,
          intentosCorrectos: 7,
          porcentajeAciertos: 70.0,
        },
      ],
    });

    renderConApp(<ProgresoPage />, { ruta: '/estudiante/progreso' });

    await waitFor(() => {
      expect(screen.getByText('Mi progreso académico')).toBeInTheDocument();
    });

    // Validar KPIs
    expect(screen.getAllByText('Intermedio').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('60 %').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();

    // Validar tabla y gráfico
    expect(screen.getByText('Álgebra y Funciones')).toBeInTheDocument();
    expect(screen.getByText('Geometría y Medición')).toBeInTheDocument();
    expect(screen.getByText('Mejora')).toBeInTheDocument();
    expect(screen.getByText('Diagnóstico pendiente')).toBeInTheDocument();

    // Validar tendencia semanal con 2 semanas
    expect(screen.getByText('Sem 42')).toBeInTheDocument();
    expect(screen.getByText('Sem 43')).toBeInTheDocument();
  });

  it('gestiona correctamente la gráfica de tendencia semanal con una sola semana registrada', async () => {
    obtenerMiProgreso.mockResolvedValue({
      totalIntentos: 5,
      ejerciciosCompletados: 3,
      nivelGeneral: 'BASICO',
      porcentajeGeneral: 50.0,
      evaluacionParcial: false,
      dimensiones: [],
      tendenciaSemanal: [
        {
          anio: 2026,
          semana: 44,
          fechaInicio: '2026-10-26',
          etiqueta: 'Sem 44',
          intentosEvaluados: 5,
          intentosCorrectos: 3,
          porcentajeAciertos: 60.0,
        },
      ],
    });

    renderConApp(<ProgresoPage />, { ruta: '/estudiante/progreso' });

    await waitFor(() => {
      expect(screen.getByText(/registras una semana evaluada/i)).toBeInTheDocument();
    });

    expect(screen.getByText('Sem 44')).toBeInTheDocument();
  });

  it('muestra mensaje invitando a practicar cuando la tendencia semanal tiene cero semanas', async () => {
    obtenerMiProgreso.mockResolvedValue({
      totalIntentos: 8,
      ejerciciosCompletados: 4,
      nivelGeneral: 'BASICO',
      porcentajeGeneral: 50.0,
      evaluacionParcial: false,
      dimensiones: [],
      tendenciaSemanal: [],
    });

    renderConApp(<ProgresoPage />, { ruta: '/estudiante/progreso' });

    await waitFor(() => {
      expect(
        screen.getByText(/aún no se registran semanas con intentos evaluados/i),
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /comenzar práctica/i })).toBeInTheDocument();
  });

  it('muestra error y permite reintentar la consulta si el backend falla', async () => {
    const error500 = {
      response: {
        status: 500,
        data: { message: 'Fallo interno al calcular métricas' },
      },
    };
    obtenerMiProgreso.mockRejectedValueOnce(error500);

    renderConApp(<ProgresoPage />, { ruta: '/estudiante/progreso' });

    await waitFor(() => {
      expect(screen.getByText(/fallo interno al calcular métricas/i)).toBeInTheDocument();
    });

    // Preparamos respuesta exitosa para el reintento
    obtenerMiProgreso.mockResolvedValueOnce({
      totalIntentos: 1,
      ejerciciosCompletados: 1,
      nivelGeneral: 'AVANZADO',
      porcentajeGeneral: 100.0,
      evaluacionParcial: false,
      dimensiones: [],
      tendenciaSemanal: [],
    });

    const botonReintentar = screen.getByRole('button', { name: /reintentar/i });
    await userEvent.click(botonReintentar);

    await waitFor(() => {
      expect(screen.queryByText(/fallo interno al calcular métricas/i)).not.toBeInTheDocument();
    });
    expect(screen.getByText('Avanzado')).toBeInTheDocument();
  });

  it('no actualiza el estado ni produce errores si el componente se desmonta antes de resolver la promesa', async () => {
    let resolverPeticion;
    obtenerMiProgreso.mockReturnValue(
      new Promise((resolve) => {
        resolverPeticion = resolve;
      }),
    );

    const { unmount } = renderConApp(<ProgresoPage />, { ruta: '/estudiante/progreso' });

    // Desmontamos el componente mientras la solicitud está pendiente
    unmount();

    // Resolvemos la promesa en diferido
    resolverPeticion({
      totalIntentos: 5,
      ejerciciosCompletados: 3,
      nivelGeneral: 'BASICO',
      porcentajeGeneral: 50.0,
      evaluacionParcial: false,
      dimensiones: [],
      tendenciaSemanal: [],
    });

    // Esperamos un tick del microtask queue para confirmar que no lanza warning ni error
    await new Promise((r) => setTimeout(r, 10));
  });
});
