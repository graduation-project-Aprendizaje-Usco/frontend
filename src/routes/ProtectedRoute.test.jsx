import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router';
import { guardarSesion, renderConApp, tokenDePrueba } from '../test/utilidades';
import ProtectedRoute from './ProtectedRoute';

vi.mock('../api/authApi', () => ({ me: vi.fn(() => new Promise(() => {})) }));

function Rutas() {
  return (
    <Routes>
      <Route path="/login" element={<p>Pantalla de login</p>} />
      <Route path="/no-autorizado" element={<p>Acceso restringido</p>} />
      <Route element={<ProtectedRoute roles={['ADMIN']} />}>
        <Route path="/admin" element={<p>Panel de administración</p>} />
      </Route>
    </Routes>
  );
}

describe('ProtectedRoute', () => {
  it('sin sesión envía a /login', () => {
    renderConApp(<Rutas />, { ruta: '/admin' });
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
  });

  it('con otro rol envía a /no-autorizado', () => {
    guardarSesion({ token: tokenDePrueba({ rol: 'ESTUDIANTE' }) });
    renderConApp(<Rutas />, { ruta: '/admin' });
    expect(screen.getByText('Acceso restringido')).toBeInTheDocument();
  });

  it('con el rol correcto muestra la página', () => {
    guardarSesion({ token: tokenDePrueba({ rol: 'ADMIN' }) });
    renderConApp(<Rutas />, { ruta: '/admin' });
    expect(screen.getByText('Panel de administración')).toBeInTheDocument();
  });

  it('un estudiante que se pone rol ADMIN en localStorage no entra (hallazgo 3)', () => {
    localStorage.setItem('token', tokenDePrueba({ rol: 'ESTUDIANTE' }));
    localStorage.setItem('usuario', JSON.stringify({ nombres: 'Ana', rol: 'ADMIN' }));
    renderConApp(<Rutas />, { ruta: '/admin' });
    expect(screen.getByText('Acceso restringido')).toBeInTheDocument();
  });
});
