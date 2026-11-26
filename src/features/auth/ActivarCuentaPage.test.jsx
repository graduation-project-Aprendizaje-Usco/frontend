import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router';
import { activarCuenta } from '../../api/authApi';
import { renderConApp } from '../../test/utilidades';
import ActivarCuentaPage from './ActivarCuentaPage';
import LoginPage from './LoginPage';

vi.mock('../../api/authApi', () => ({
  activarCuenta: vi.fn(),
  login: vi.fn(),
  me: vi.fn(() => new Promise(() => {})),
}));

function Rutas() {
  return (
    <Routes>
      <Route path="/activar-cuenta" element={<ActivarCuentaPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

describe('ActivarCuentaPage', () => {
  beforeEach(() => {
    activarCuenta.mockReset();
  });

  it('requiere enlace, contraseñas válidas y confirmación coincidente', async () => {
    const usuario = userEvent.setup();
    renderConApp(<Rutas />, { ruta: '/activar-cuenta?token=token-prueba' });

    await usuario.type(screen.getByLabelText(/^Nueva contraseña/), 'SoloLetras');
    await usuario.type(screen.getByLabelText(/^Confirmar contraseña/), 'OtraClave1');
    await usuario.click(screen.getByRole('button', { name: 'Guardar contraseña' }));

    expect(await screen.findByText('La contraseña debe tener al menos una letra y un número')).toBeInTheDocument();
    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
    expect(activarCuenta).not.toHaveBeenCalled();
  });

  it('activa la cuenta y vuelve al login con confirmación', async () => {
    activarCuenta.mockResolvedValue();
    const usuario = userEvent.setup();
    renderConApp(<Rutas />, { ruta: '/activar-cuenta?token=token-seguro' });

    await usuario.type(screen.getByLabelText(/^Nueva contraseña/), 'Clave2026*');
    await usuario.type(screen.getByLabelText(/^Confirmar contraseña/), 'Clave2026*');
    await usuario.click(screen.getByRole('button', { name: 'Guardar contraseña' }));

    expect(activarCuenta).toHaveBeenCalledWith({ token: 'token-seguro', password: 'Clave2026*' });
    expect(await screen.findByText(/Tu contraseña quedó configurada/)).toBeInTheDocument();
  });

  it('rechaza abrir la pantalla sin token', () => {
    renderConApp(<Rutas />, { ruta: '/activar-cuenta' });

    expect(screen.getByRole('alert')).toHaveTextContent('El enlace no contiene un token válido.');
  });
});
