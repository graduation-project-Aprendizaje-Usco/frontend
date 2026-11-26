import { act, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { me } from '../api/authApi';
import { guardarSesion, renderConApp, tokenDePrueba } from '../test/utilidades';
import { useAuth } from './AuthContext';

vi.mock('../api/authApi', () => ({ me: vi.fn() }));

/** Muestra el usuario de la sesión para poder revisarlo en las pruebas. */
function Sesion() {
  const { user } = useAuth();
  return <pre data-testid="sesion">{user ? JSON.stringify(user) : 'sin sesión'}</pre>;
}

const sesion = () => {
  const texto = screen.getByTestId('sesion').textContent;
  return texto === 'sin sesión' ? null : JSON.parse(texto);
};

describe('AuthContext', () => {
  beforeEach(() => {
    me.mockReset();
    me.mockReturnValue(new Promise(() => {})); // por defecto /me no responde
  });

  it('arma la sesión con id, correo y rol del token y el nombre guardado', () => {
    guardarSesion({ token: tokenDePrueba({ id: 7, rol: 'DOCENTE', correo: 'docente@aprendizaje.test' }), nombres: 'Lina' });

    renderConApp(<Sesion />);

    expect(sesion()).toEqual({ id: 7, correo: 'docente@aprendizaje.test', rol: 'DOCENTE', nombres: 'Lina' });
  });

  it('ignora un rol editado a mano en localStorage: manda el del token (hallazgo 3)', () => {
    localStorage.setItem('token', tokenDePrueba({ rol: 'ESTUDIANTE' }));
    localStorage.setItem('usuario', JSON.stringify({ nombres: 'Ana', rol: 'ADMIN' }));

    renderConApp(<Sesion />);

    expect(sesion().rol).toBe('ESTUDIANTE');
  });

  it('descarta un token vencido y limpia localStorage', () => {
    guardarSesion({ token: tokenDePrueba({ segundos: -60 }) });

    renderConApp(<Sesion />);

    expect(sesion()).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('descarta un token con un rol que no existe', () => {
    guardarSesion({ token: tokenDePrueba({ rol: 'SUPERADMIN' }) });

    renderConApp(<Sesion />);

    expect(sesion()).toBeNull();
  });

  it('cierra la sesión si /me responde 401 al abrir la app (usuario desactivado)', async () => {
    guardarSesion({ token: tokenDePrueba() });
    me.mockRejectedValue({ response: { status: 401 } });

    renderConApp(<Sesion />);

    await waitFor(() => expect(sesion()).toBeNull());
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('cierra la sesión si /me dice que el rol cambió', async () => {
    guardarSesion({ token: tokenDePrueba({ id: 1, rol: 'ESTUDIANTE' }) });
    me.mockResolvedValue({ id: 1, nombres: 'Ana', correo: 'u20201234567@usco.edu.co', rol: 'DOCENTE' });

    renderConApp(<Sesion />);

    await waitFor(() => expect(sesion()).toBeNull());
  });

  it('conserva la sesión si el backend no responde (sin conexión)', async () => {
    guardarSesion({ token: tokenDePrueba() });
    me.mockRejectedValue({ request: {} });

    renderConApp(<Sesion />);

    await waitFor(() => expect(me).toHaveBeenCalled());
    expect(sesion()).not.toBeNull();
  });

  it('actualiza el nombre con lo que responde /me', async () => {
    guardarSesion({ token: tokenDePrueba({ id: 1 }), nombres: 'Nombre viejo' });
    me.mockResolvedValue({ id: 1, nombres: 'Ana María', correo: 'u20201234567@usco.edu.co', rol: 'ESTUDIANTE' });

    renderConApp(<Sesion />);

    await waitFor(() => expect(sesion().nombres).toBe('Ana María'));
  });

  it('al volver con Atrás desde la caché del navegador, relee localStorage (error de cerrar sesión)', () => {
    guardarSesion({ token: tokenDePrueba() });
    renderConApp(<Sesion />);
    expect(sesion()).not.toBeNull();

    // Se cerró sesión (localStorage limpio) y el navegador restaura la página vieja.
    localStorage.clear();
    act(() => {
      const evento = new Event('pageshow');
      Object.defineProperty(evento, 'persisted', { value: true });
      window.dispatchEvent(evento);
    });

    expect(sesion()).toBeNull();
  });

  it('cierra la sesión cuando se cierra en otra pestaña', () => {
    guardarSesion({ token: tokenDePrueba() });
    renderConApp(<Sesion />);

    localStorage.clear();
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'token' }));
    });

    expect(sesion()).toBeNull();
  });
});
