import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { invitarEstudiante } from '../../../api/invitacionesApi';
import { renderConApp } from '../../../test/utilidades';
import InvitarEstudianteCard from './InvitarEstudianteCard';

vi.mock('../../../api/invitacionesApi', () => ({ invitarEstudiante: vi.fn() }));

const ESTUDIANTE = {
  correo: 'u20201234567@usco.edu.co',
  nombres: 'Ana María',
  apellidos: 'Pérez Gómez',
};

async function llenarFormulario(usuario, datos = ESTUDIANTE) {
  await usuario.type(screen.getByLabelText(/^Correo institucional/), datos.correo);
  await usuario.type(screen.getByLabelText(/^Nombres/), datos.nombres);
  await usuario.type(screen.getByLabelText(/^Apellidos/), datos.apellidos);
}

const enviar = (usuario) => usuario.click(screen.getByRole('button', { name: 'Enviar invitación' }));

describe('InvitarEstudianteCard', () => {
  beforeEach(() => {
    invitarEstudiante.mockReset();
    invitarEstudiante.mockResolvedValue({ id: 7, correo: ESTUDIANTE.correo, estado: 'INVITADO' });
  });

  it('exige los tres campos antes de enviar', async () => {
    const usuario = userEvent.setup();
    renderConApp(<InvitarEstudianteCard grupoId={3} />);

    await enviar(usuario);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Completa el correo, los nombres y los apellidos.',
    );
    expect(invitarEstudiante).not.toHaveBeenCalled();
  });

  it('rechaza un correo que no es institucional', async () => {
    const usuario = userEvent.setup();
    renderConApp(<InvitarEstudianteCard grupoId={3} />);

    await llenarFormulario(usuario, { ...ESTUDIANTE, correo: 'ana@gmail.com' });
    await enviar(usuario);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Usa el correo institucional: u + 11 dígitos + @usco.edu.co.',
    );
    expect(invitarEstudiante).not.toHaveBeenCalled();
  });

  it('envía la invitación individual, avisa y recarga la lista', async () => {
    const usuario = userEvent.setup();
    const onInvitado = vi.fn();
    renderConApp(<InvitarEstudianteCard grupoId={3} onInvitado={onInvitado} />);

    await llenarFormulario(usuario);
    await enviar(usuario);

    expect(await screen.findByRole('status')).toHaveTextContent(
      `Invitación enviada a ${ESTUDIANTE.correo}.`,
    );
    expect(invitarEstudiante).toHaveBeenCalledWith(3, ESTUDIANTE);
    expect(onInvitado).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText(/^Correo institucional/)).toHaveValue('');
  });

  it('muestra el mensaje del backend cuando falla el envío', async () => {
    invitarEstudiante.mockRejectedValue({
      response: { data: { message: 'El estudiante ya tiene cuenta; inscríbelo directamente en el grupo' } },
    });
    const usuario = userEvent.setup();
    renderConApp(<InvitarEstudianteCard grupoId={3} />);

    await llenarFormulario(usuario);
    await enviar(usuario);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El estudiante ya tiene cuenta; inscríbelo directamente en el grupo',
    );
  });
});
