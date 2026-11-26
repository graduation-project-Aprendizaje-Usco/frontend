import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listar, obtenerResumen } from '../../api/adminUsuariosApi';
import { guardarSesion, renderConApp, tokenDePrueba } from '../../test/utilidades';
import InicioAdminPage from './InicioAdminPage';
import UsuariosPage from './UsuariosPage';

vi.mock('../../api/authApi', () => ({ me: vi.fn(() => new Promise(() => {})) }));
vi.mock('../../api/adminUsuariosApi', () => ({
  obtenerResumen: vi.fn(),
  listar: vi.fn(),
  crear: vi.fn(),
  actualizar: vi.fn(),
  cambiarEstado: vi.fn(),
}));

describe('InicioAdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    guardarSesion({ token: tokenDePrueba({ id: 1, rol: 'ADMIN', correo: 'ada@usco.edu.co' }), nombres: 'Ada' });
  });

  it('muestra los conteos reales y enlaza cada rol a Usuarios con su filtro', async () => {
    obtenerResumen.mockResolvedValue({
      usuariosPorRol: [
        { rol: 'ESTUDIANTE', total: 40, activos: 38 },
        { rol: 'DOCENTE', total: 3, activos: 3 },
        { rol: 'ADMIN', total: 1, activos: 1 },
      ],
      grupos: 2,
      contenidosActivos: 18,
      ejerciciosActivos: 90,
    });
    renderConApp(<InicioAdminPage />);

    const estudiantes = await screen.findByRole('region', { name: 'Estudiantes' });
    expect(within(estudiantes).getByText('40')).toBeInTheDocument();
    expect(within(estudiantes).getByText('38 activos')).toBeInTheDocument();
    expect(within(estudiantes).getByRole('link', { name: 'Ver estudiantes' })).toHaveAttribute(
      'href',
      '/admin/usuarios?rol=ESTUDIANTE',
    );
    expect(screen.getByRole('link', { name: 'Ver docentes' })).toHaveAttribute('href', '/admin/usuarios?rol=DOCENTE');
    const grupos = screen.getByRole('region', { name: 'Grupos' });
    expect(within(grupos).getByText('2')).toBeInTheDocument();
    expect(within(grupos).getByRole('link', { name: 'Ver grupos' })).toHaveAttribute('href', '/admin/grupos');
    const contenidos = screen.getByRole('region', { name: 'Contenidos activos' });
    expect(within(contenidos).getByText('18')).toBeInTheDocument();
    expect(within(contenidos).getByRole('link', { name: 'Ver contenidos' })).toHaveAttribute(
      'href',
      '/admin/actividades?tab=contenidos',
    );
    const ejercicios = screen.getByRole('region', { name: 'Ejercicios activos' });
    expect(within(ejercicios).getByText('90')).toBeInTheDocument();
    expect(within(ejercicios).getByRole('link', { name: 'Ver ejercicios' })).toHaveAttribute(
      'href',
      '/admin/actividades?tab=ejercicios',
    );
  });

  it('muestra un error si el resumen no carga', async () => {
    obtenerResumen.mockRejectedValue({ response: { status: 500, data: { message: 'Falló' } } });
    renderConApp(<InicioAdminPage />);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('Usuarios abre con el filtro de rol que llega en el enlace', async () => {
    listar.mockResolvedValue([]);
    renderConApp(<UsuariosPage />, { ruta: '/admin/usuarios?rol=DOCENTE' });
    await screen.findByText('No hay usuarios con estos filtros.');
    expect(listar).toHaveBeenCalledWith({ buscar: '', rol: 'DOCENTE', estado: '' });
  });
});
