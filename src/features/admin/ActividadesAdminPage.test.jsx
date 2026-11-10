import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { obtener } from '../../api/adminActividadesApi';
import { guardarSesion, renderConApp, tokenDePrueba } from '../../test/utilidades';
import ActividadesAdminPage from './ActividadesAdminPage';

vi.mock('../../api/authApi', () => ({ me: vi.fn(() => new Promise(() => {})) }));
vi.mock('../../api/adminActividadesApi', () => ({ obtener: vi.fn() }));

const datos = {
  contenidos: [
    {
      id: 1,
      titulo: 'Contenido del docente',
      tema: 'Derivadas',
      asignatura: 'CALCULO_DIFERENCIAL',
      competenciaCodigo: 'ALGEBRAICA',
      competenciaNombre: 'Competencia algebraica',
      activo: true,
      totalEjercicios: 4,
      creadoPorCorreo: 'docente@usco.edu.co',
    },
  ],
  ejercicios: [
    {
      id: 9,
      codigo: 'DOC-ALG-1',
      contenidoTitulo: 'Contenido del docente',
      competenciaCodigo: 'ALGEBRAICA',
      nivel: 1,
      tipo: 'OPCION_MULTIPLE',
      activo: true,
      creadoPorCorreo: 'docente@usco.edu.co',
    },
  ],
};

describe('ActividadesAdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    guardarSesion({ token: tokenDePrueba({ id: 1, rol: 'ADMIN', correo: 'ada@usco.edu.co' }), nombres: 'Ada' });
    obtener.mockResolvedValue(datos);
  });

  it('muestra contenidos y ejercicios en pestañas separadas', async () => {
    const usuario = userEvent.setup();
    renderConApp(<ActividadesAdminPage />);

    expect(await screen.findByText('Contenido del docente')).toBeInTheDocument();
    expect(screen.getByText('docente@usco.edu.co')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();

    await usuario.click(screen.getByRole('tab', { name: 'Ejercicios (1)' }));
    expect(await screen.findByText('DOC-ALG-1')).toBeInTheDocument();
  });

  it('abre directamente la pestaña de ejercicios con ?tab=ejercicios', async () => {
    renderConApp(<ActividadesAdminPage />, { ruta: '/admin/actividades?tab=ejercicios' });
    expect(await screen.findByText('DOC-ALG-1')).toBeInTheDocument();
    expect(screen.queryByText('Derivadas')).not.toBeInTheDocument();
  });

  it('muestra un error si no cargan las actividades', async () => {
    obtener.mockRejectedValue({ response: { status: 500, data: { message: 'Falló' } } });
    renderConApp(<ActividadesAdminPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Falló');
  });
});
