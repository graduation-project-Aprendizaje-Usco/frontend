import { screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { guardarSesion, renderConApp, tokenDePrueba } from '../../test/utilidades';
import RolesPage from './RolesPage';

vi.mock('../../api/authApi', () => ({ me: vi.fn(() => new Promise(() => {})) }));

describe('RolesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    guardarSesion({ token: tokenDePrueba({ id: 1, rol: 'ADMIN', correo: 'ada@usco.edu.co' }), nombres: 'Ada' });
  });

  it('explica los roles y enlaza a Usuarios con el filtro de cada uno', () => {
    renderConApp(<RolesPage />, { ruta: '/admin/roles' });

    const tabla = screen.getByRole('table', { name: 'Roles y permisos de la plataforma' });
    expect(within(tabla).getByText('Estudiante')).toBeInTheDocument();
    expect(within(tabla).getByText('Docente')).toBeInTheDocument();
    expect(within(tabla).getByText('Administrador')).toBeInTheDocument();
    expect(within(tabla).getAllByRole('link', { name: 'Ver usuarios' })[0]).toHaveAttribute(
      'href',
      '/admin/usuarios?rol=ESTUDIANTE',
    );
    expect(within(tabla).getAllByRole('link', { name: 'Ver usuarios' })[2]).toHaveAttribute(
      'href',
      '/admin/usuarios?rol=ADMIN',
    );
  });
});
