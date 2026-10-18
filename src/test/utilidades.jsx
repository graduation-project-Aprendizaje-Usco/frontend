/**
 * Ayudas para las pruebas del frontend.
 *
 *  - tokenDePrueba(): un JWT con la forma real (header.payload.firma) y los claims del
 *    contrato. La firma es falsa: jwt-decode no la verifica, el backend sí.
 *  - renderConApp(): renderiza dentro de los mismos proveedores que main.jsx
 *    (tema, enrutador en memoria y AuthProvider).
 */
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme/theme';
import { AuthProvider } from '../context/AuthContext';

function base64Url(objeto) {
  const bytes = new TextEncoder().encode(JSON.stringify(objeto));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function tokenDePrueba({ id = 1, correo = 'u20201234567@usco.edu.co', rol = 'ESTUDIANTE', segundos = 3600 } = {}) {
  const ahora = Math.floor(Date.now() / 1000);
  const payload = { sub: String(id), correo, rol, iat: ahora, exp: ahora + segundos };
  return `${base64Url({ alg: 'HS256' })}.${base64Url(payload)}.firma-de-prueba`;
}

/** Deja una sesión guardada en localStorage, como la deja el login. */
export function guardarSesion({ token, nombres = 'Ana' }) {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify({ nombres }));
}

export function renderConApp(elemento, { ruta = '/' } = {}) {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[ruta]}>
        <AuthProvider>{elemento}</AuthProvider>
      </MemoryRouter>
    </ThemeProvider>,
  );
}
