import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Route, Routes } from 'react-router';
import { registro } from '../../api/authApi';
import { renderConApp } from '../../test/utilidades';
import LoginPage from './LoginPage';
import RegistroPage from './RegistroPage';
import { MENSAJE_CORREO_ESTUDIANTE, MENSAJE_PASSWORD } from './reglasRegistro';

vi.mock('../../api/authApi', () => ({
  registro: vi.fn(),
  login: vi.fn(),
  me: vi.fn(() => new Promise(() => {})),
}));

function Rutas() {
  return (
    <Routes>
      <Route path="/registro" element={<RegistroPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

async function llenar(usuario, datos = {}) {
  const valores = {
    nombres: 'Ana María',
    apellidos: 'Pérez Gómez',
    correo: 'u20201234567@usco.edu.co',
    password: 'Clave2026*',
    confirmar: 'Clave2026*',
    programa: 'Ingeniería Civil',
    ...datos,
  };
  if (valores.nombres) await usuario.type(screen.getByLabelText(/^Nombres/), valores.nombres);
  if (valores.apellidos) await usuario.type(screen.getByLabelText(/^Apellidos/), valores.apellidos);
  if (valores.correo) await usuario.type(screen.getByLabelText(/^Correo institucional/), valores.correo);
  if (valores.password) await usuario.type(screen.getByLabelText(/^Contraseña/), valores.password);
  if (valores.confirmar) await usuario.type(screen.getByLabelText(/^Confirmar contraseña/), valores.confirmar);
  if (valores.programa) {
    await usuario.click(screen.getByRole('combobox', { name: /Programa académico/ }));
    await usuario.click(within(screen.getByRole('listbox')).getByRole('option', { name: valores.programa }));
  }
}

const enviar = (usuario) => usuario.click(screen.getByRole('button', { name: 'Crear cuenta' }));

describe('RegistroPage', () => {
  beforeEach(() => {
    registro.mockReset();
  });

  it('el login enlaza a la pantalla de registro (hallazgo 1)', async () => {
    const usuario = userEvent.setup();
    renderConApp(<Rutas />, { ruta: '/login' });

    await usuario.click(screen.getByRole('link', { name: 'Crear cuenta' }));

    expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeInTheDocument();
  });

  it('muestra los errores de los campos vacíos y no llama al backend', async () => {
    const usuario = userEvent.setup();
    renderConApp(<Rutas />, { ruta: '/registro' });

    await enviar(usuario);

    expect(await screen.findByText('Escribe tus nombres')).toBeInTheDocument();
    expect(screen.getByText('Escribe tu correo institucional')).toBeInTheDocument();
    expect(screen.getByText('Elige tu programa académico')).toBeInTheDocument();
    expect(registro).not.toHaveBeenCalled();
  });

  it.each(['ana.perez@usco.edu.co', 'u2020123456@usco.edu.co', 'u20201234567@gmail.com'])(
    'rechaza el correo %s porque no es de estudiante',
    async (correo) => {
      const usuario = userEvent.setup();
      renderConApp(<Rutas />, { ruta: '/registro' });

      await llenar(usuario, { correo });
      await enviar(usuario);

      expect(await screen.findByText(MENSAJE_CORREO_ESTUDIANTE)).toBeInTheDocument();
      expect(registro).not.toHaveBeenCalled();
    },
  );

  it('exige letra y número en la contraseña y que la confirmación coincida', async () => {
    const usuario = userEvent.setup();
    renderConApp(<Rutas />, { ruta: '/registro' });

    await llenar(usuario, { password: 'SoloLetras', confirmar: 'OtraCosa1' });
    await enviar(usuario);

    expect(await screen.findByText(MENSAJE_PASSWORD)).toBeInTheDocument();
    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
  });

  it('registra con los datos correctos y vuelve al login con el aviso y el correo escrito', async () => {
    registro.mockResolvedValue({ id: 9, nombres: 'Ana María', correo: 'u20201234567@usco.edu.co', rol: 'ESTUDIANTE' });
    const usuario = userEvent.setup();
    renderConApp(<Rutas />, { ruta: '/registro' });

    await llenar(usuario, { correo: 'U20201234567@USCO.edu.co' });
    await enviar(usuario);

    await waitFor(() =>
      expect(registro).toHaveBeenCalledWith({
        nombres: 'Ana María',
        apellidos: 'Pérez Gómez',
        correo: 'u20201234567@usco.edu.co',
        programaAcademico: 'Ingeniería Civil',
        password: 'Clave2026*',
      }),
    );
    expect(await screen.findByText(/Tu cuenta quedó creada/)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Correo institucional/)).toHaveValue('u20201234567@usco.edu.co');
  });

  it('muestra en el campo correo el 409 de correo ya registrado', async () => {
    registro.mockRejectedValue({
      response: { status: 409, data: { status: 409, message: 'El correo ya está registrado' } },
    });
    const usuario = userEvent.setup();
    renderConApp(<Rutas />, { ruta: '/registro' });

    await llenar(usuario);
    await enviar(usuario);

    expect(await screen.findByText('El correo ya está registrado')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Correo institucional/)).toHaveAttribute('aria-invalid', 'true');
  });

  it('lleva a cada campo los errores 400 que devuelve el backend', async () => {
    registro.mockRejectedValue({
      response: {
        status: 400,
        data: {
          status: 400,
          message: 'La solicitud tiene campos inválidos',
          errores: [{ campo: 'programaAcademico', mensaje: 'Elige un programa académico de la lista' }],
        },
      },
    });
    const usuario = userEvent.setup();
    renderConApp(<Rutas />, { ruta: '/registro' });

    await llenar(usuario);
    await enviar(usuario);

    expect(await screen.findByText('Elige un programa académico de la lista')).toBeInTheDocument();
  });

  it('muestra un error general si no hay conexión con el servidor', async () => {
    registro.mockRejectedValue({ request: {} });
    const usuario = userEvent.setup();
    renderConApp(<Rutas />, { ruta: '/registro' });

    await llenar(usuario);
    await enviar(usuario);

    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos conectar con el servidor');
  });
});
