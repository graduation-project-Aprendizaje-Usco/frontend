import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router';
import { login } from '../../api/authApi';
import { renderConApp, tokenDePrueba } from '../../test/utilidades';
import LoginPage from './LoginPage';

vi.mock('../../api/authApi', () => ({ login: vi.fn(), me: vi.fn(() => new Promise(() => {})) }));

function Rutas() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/estudiante" element={<p>Inicio del estudiante</p>} />
      <Route path="/docente" element={<p>Inicio del docente</p>} />
    </Routes>
  );
}

async function iniciarSesion(usuario, correo, password) {
  await usuario.type(screen.getByLabelText(/^Correo institucional/), correo);
  await usuario.type(screen.getByLabelText(/^Contraseña/), password);
  await usuario.click(screen.getByRole('button', { name: 'Ingresar' }));
}

describe('LoginPage', () => {
  beforeEach(() => {
    login.mockReset();
  });

  it('valida los campos antes de llamar al backend', async () => {
    const usuario = userEvent.setup();
    renderConApp(<Rutas />, { ruta: '/login' });

    await usuario.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(await screen.findByText('Escribe tu correo institucional')).toBeInTheDocument();
    expect(screen.getByText('Escribe tu contraseña')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('muestra el mensaje genérico del backend con credenciales erradas', async () => {
    login.mockImplementation(async () => {
      throw { response: { status: 401, data: { status: 401, message: 'Correo o contraseña incorrectos' } } };
    });
    const usuario = userEvent.setup();
    renderConApp(<Rutas />, { ruta: '/login' });

    await iniciarSesion(usuario, 'u20201234567@usco.edu.co', 'mala');

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos');
  });

  it('con credenciales correctas entra al inicio del rol que trae el token', async () => {
    login.mockResolvedValue({
      token: tokenDePrueba({ rol: 'DOCENTE', correo: 'docente@aprendizaje.test' }),
      tipo: 'Bearer',
      expiraEn: 3600,
      usuario: { id: 1, nombres: 'Docente', correo: 'docente@aprendizaje.test', rol: 'DOCENTE' },
    });
    const usuario = userEvent.setup();
    renderConApp(<Rutas />, { ruta: '/login' });

    await iniciarSesion(usuario, 'docente@aprendizaje.test', 'Docente2026*');

    expect(await screen.findByText('Inicio del docente')).toBeInTheDocument();
    expect(localStorage.getItem('token')).not.toBeNull();
  });
});
