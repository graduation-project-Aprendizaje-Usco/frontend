import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { actualizar, cambiarEstado, crear, listar, reenviarActivacion } from '../../api/adminUsuariosApi';
import { guardarSesion, renderConApp, tokenDePrueba } from '../../test/utilidades';
import UsuariosPage from './UsuariosPage';

vi.mock('../../api/authApi', () => ({ me: vi.fn(() => new Promise(() => {})) }));
vi.mock('../../api/adminUsuariosApi', () => ({
  listar: vi.fn(),
  crear: vi.fn(),
  actualizar: vi.fn(),
  cambiarEstado: vi.fn(),
  reenviarActivacion: vi.fn(),
}));

const ADMIN_ID = 1;
const usuarios = [
  { id: ADMIN_ID, nombres: 'Ada', apellidos: 'Admin', correo: 'ada@usco.edu.co', rol: 'ADMIN', programaAcademico: null, estado: 'ACTIVO' },
  { id: 2, nombres: 'Diego', apellidos: 'Docente', correo: 'diego@usco.edu.co', rol: 'DOCENTE', programaAcademico: null, estado: 'ACTIVO' },
  { id: 3, nombres: 'Eva', apellidos: 'Estudiante', correo: 'u20250000001@usco.edu.co', rol: 'ESTUDIANTE', programaAcademico: 'Ingeniería Civil', estado: 'INACTIVO' },
];

async function abrir() {
  const usuario = userEvent.setup();
  renderConApp(<UsuariosPage />);
  await screen.findByText('3 usuarios');
  return usuario;
}

describe('UsuariosPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    guardarSesion({ token: tokenDePrueba({ id: ADMIN_ID, rol: 'ADMIN', correo: 'ada@usco.edu.co' }), nombres: 'Ada' });
    listar.mockResolvedValue(usuarios);
  });

  it('lista los usuarios y filtra por texto, rol y estado', async () => {
    const usuario = await abrir();
    expect(screen.getByText('Diego Docente')).toBeInTheDocument();
    expect(screen.getByText('Ingeniería Civil')).toBeInTheDocument();

    await usuario.type(screen.getByLabelText('Buscar por nombre o correo'), 'eva');
    await usuario.click(screen.getByRole('combobox', { name: 'Rol' }));
    await usuario.click(await screen.findByRole('option', { name: 'Estudiante' }));
    await usuario.click(screen.getByRole('combobox', { name: 'Estado' }));
    await usuario.click(await screen.findByRole('option', { name: 'Inactivo' }));

    await waitFor(() =>
      expect(listar).toHaveBeenLastCalledWith({ buscar: 'eva', rol: 'ESTUDIANTE', estado: 'INACTIVO' }),
    );
  });

  it('crea un usuario y confirma el envío del enlace de configuración', async () => {
    crear.mockResolvedValue({
      usuario: { ...usuarios[1], id: 9, correo: 'nuevo@usco.edu.co', configuracionPendiente: true },
    });
    const usuario = await abrir();

    await usuario.click(screen.getByRole('button', { name: 'Nuevo usuario' }));
    const dialogo = screen.getByRole('dialog', { name: 'Crear usuario' });
    await usuario.type(within(dialogo).getByLabelText('Nombres'), 'Nuevo');
    await usuario.type(within(dialogo).getByLabelText('Apellidos'), 'Docente');
    await usuario.type(within(dialogo).getByLabelText('Correo'), 'nuevo@usco.edu.co');
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }));

    expect(crear).toHaveBeenCalledWith({
      nombres: 'Nuevo', apellidos: 'Docente', correo: 'nuevo@usco.edu.co', rol: 'DOCENTE', programaAcademico: null,
    });
    expect(await screen.findByText(/Se envió un correo a/)).toBeInTheDocument();
    expect(screen.getByText(/El enlace es de un solo uso y vence en 7 días/)).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Listo' }));
    expect(screen.queryByText(/contraseña temporal/i)).not.toBeInTheDocument();
  });

  it('permite reenviar el enlace mientras la cuenta está pendiente', async () => {
    listar.mockResolvedValue([
      usuarios[0],
      { ...usuarios[1], configuracionPendiente: true },
      usuarios[2],
    ]);
    reenviarActivacion.mockResolvedValue();
    const usuario = await abrir();

    await usuario.click(screen.getByRole('button', { name: 'Reenviar enlace a Diego Docente' }));

    expect(reenviarActivacion).toHaveBeenCalledWith(2);
    expect(await screen.findByText(/Se reenvió el enlace de configuración a diego@usco.edu.co/)).toBeInTheDocument();
  });

  it('exige correo de estudiante y programa cuando el rol es Estudiante', async () => {
    const usuario = await abrir();
    await usuario.click(screen.getByRole('button', { name: 'Nuevo usuario' }));
    const dialogo = screen.getByRole('dialog', { name: 'Crear usuario' });
    await usuario.type(within(dialogo).getByLabelText('Nombres'), 'Ana');
    await usuario.type(within(dialogo).getByLabelText('Apellidos'), 'Ruiz');
    await usuario.type(within(dialogo).getByLabelText('Correo'), 'ana@usco.edu.co');
    await usuario.click(within(dialogo).getByRole('combobox', { name: 'Rol' }));
    await usuario.click(await screen.findByRole('option', { name: 'Estudiante' }));
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }));

    expect(await within(dialogo).findByText(/u \+ 11 dígitos/)).toBeInTheDocument();
    expect(within(dialogo).getByText('Elige el programa académico')).toBeInTheDocument();
    expect(crear).not.toHaveBeenCalled();
  });

  it('edita el rol de un usuario', async () => {
    actualizar.mockResolvedValue({});
    const usuario = await abrir();
    await usuario.click(screen.getByRole('button', { name: 'Editar a Diego Docente' }));
    const dialogo = screen.getByRole('dialog', { name: 'Editar usuario' });
    expect(within(dialogo).getByLabelText('Correo')).toBeDisabled();
    await usuario.click(within(dialogo).getByRole('combobox', { name: 'Rol' }));
    await usuario.click(await screen.findByRole('option', { name: 'Administrador' }));
    await usuario.click(within(dialogo).getByRole('button', { name: 'Guardar' }));

    expect(actualizar).toHaveBeenCalledWith(2, {
      nombres: 'Diego', apellidos: 'Docente', rol: 'ADMIN', programaAcademico: null,
    });
    expect(await screen.findByText('Los cambios quedaron guardados.')).toBeInTheDocument();
  });

  it('pide confirmación antes de desactivar y no deja desactivarse a uno mismo', async () => {
    cambiarEstado.mockResolvedValue({});
    const usuario = await abrir();
    expect(screen.getByRole('button', { name: 'Desactivar a Ada Admin' })).toBeDisabled();

    await usuario.click(screen.getByRole('button', { name: 'Desactivar a Diego Docente' }));
    const confirmacion = screen.getByRole('dialog', { name: '¿Desactivar este usuario?' });
    await usuario.click(within(confirmacion).getByRole('button', { name: 'Sí, desactivar' }));

    expect(cambiarEstado).toHaveBeenCalledWith(2, 'INACTIVO');
    expect(await screen.findByText('Diego Docente quedó inactivo.')).toBeInTheDocument();
  });

  it('activa de nuevo a un usuario inactivo', async () => {
    cambiarEstado.mockResolvedValue({});
    const usuario = await abrir();
    await usuario.click(screen.getByRole('button', { name: 'Activar a Eva Estudiante' }));
    expect(cambiarEstado).toHaveBeenCalledWith(3, 'ACTIVO');
  });
});
