import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { estudiantes, listar } from '../../api/gruposApi';
import { guardarSesion, renderConApp, tokenDePrueba } from '../../test/utilidades';
import GruposAdminPage from './GruposAdminPage';

vi.mock('../../api/authApi', () => ({ me: vi.fn(() => new Promise(() => {})) }));
vi.mock('../../api/gruposApi', () => ({
  listar: vi.fn(),
  estudiantes: vi.fn(),
  crear: vi.fn(),
  inscribir: vi.fn(),
}));

const grupos = [
  { id: 1, codigo: 'CALCULO-2026-A', nombre: 'Cálculo Diferencial A', docenteCorreo: 'docente@usco.edu.co' },
  { id: 2, codigo: 'CALCULO-2026-B', nombre: 'Cálculo Diferencial B', docenteCorreo: 'otro@usco.edu.co' },
];

describe('GruposAdminPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    guardarSesion({ token: tokenDePrueba({ id: 1, rol: 'ADMIN', correo: 'ada@usco.edu.co' }), nombres: 'Ada' });
    listar.mockResolvedValue(grupos);
  });

  it('lista los grupos y muestra los estudiantes del grupo elegido', async () => {
    estudiantes.mockResolvedValue([
      { id: 7, nombres: 'Ana', apellidos: 'Pérez', correo: 'u20260000007@usco.edu.co' },
    ]);
    const usuario = userEvent.setup();
    renderConApp(<GruposAdminPage />);

    expect(await screen.findByText('Cálculo Diferencial A')).toBeInTheDocument();
    expect(screen.getByText('Cálculo Diferencial B')).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Ver estudiantes de Cálculo Diferencial A' }));

    expect(estudiantes).toHaveBeenCalledWith(1);
    expect(await screen.findByText('Pérez, Ana')).toBeInTheDocument();
    expect(screen.getByText('u20260000007@usco.edu.co')).toBeInTheDocument();
  });

  it('filtra por nombre, código o docente', async () => {
    const usuario = userEvent.setup();
    renderConApp(<GruposAdminPage />);
    await screen.findByText('Cálculo Diferencial A');

    await usuario.type(screen.getByLabelText('Buscar por código, nombre o docente'), 'otro@');
    expect(screen.queryByText('Cálculo Diferencial A')).not.toBeInTheDocument();
    expect(screen.getByText('Cálculo Diferencial B')).toBeInTheDocument();
  });

  it('muestra un error si no cargan los grupos', async () => {
    listar.mockRejectedValue({ response: { status: 500, data: { message: 'Falló' } } });
    renderConApp(<GruposAdminPage />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Falló');
  });
});
