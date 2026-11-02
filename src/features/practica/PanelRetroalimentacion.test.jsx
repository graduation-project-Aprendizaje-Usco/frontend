import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';
import theme from '../../theme/theme';
import PanelRetroalimentacion from './PanelRetroalimentacion';

function renderPanel(resultado) {
  return render(
    <ThemeProvider theme={theme}>
      <PanelRetroalimentacion resultado={resultado} />
    </ThemeProvider>,
  );
}

function resultado(cambios = {}) {
  return {
    esCorrecta: false,
    numeroIntento: 1,
    puedeReintentar: true,
    retroalimentacion: {
      tipo: 'PISTA',
      texto: 'Revisa la factorización de $x^2 + 2x$.',
      errorComun: 'Omitir el factor común.',
    },
    ...cambios,
  };
}

describe('PanelRetroalimentacion', () => {
  it('anuncia la pista y el error común en una región aria-live y recibe el foco', async () => {
    renderPanel(resultado());

    const panel = screen.getByRole('status');
    expect(panel).toHaveAttribute('aria-live', 'polite');
    expect(panel).toHaveAttribute('aria-atomic', 'true');
    expect(panel).toHaveTextContent('Respuesta incorrecta.');
    expect(panel).toHaveTextContent('Pista:');
    expect(panel).toHaveTextContent('Error frecuente: Omitir el factor común.');
    await waitFor(() => expect(panel).toHaveFocus());
  });

  it('en el segundo fallo muestra la explicación completa y avisa que no hay más reintentos', () => {
    renderPanel(
      resultado({
        numeroIntento: 2,
        puedeReintentar: false,
        retroalimentacion: {
          tipo: 'EXPLICACION',
          texto: 'La explicación completa del procedimiento.',
          errorComun: 'Omitir el factor común.',
        },
      }),
    );

    const panel = screen.getByRole('status');
    expect(panel).toHaveTextContent('Explicación:');
    expect(panel).toHaveTextContent('La explicación completa del procedimiento.');
    expect(panel).toHaveTextContent('Este fue el último intento para este ejercicio.');
  });

  it('en un acierto muestra la explicación breve sin error frecuente', () => {
    renderPanel(
      resultado({
        esCorrecta: true,
        puedeReintentar: false,
        retroalimentacion: {
          tipo: 'EXPLICACION',
          texto: 'Se extrae el factor común.',
          errorComun: null,
        },
      }),
    );

    const panel = screen.getByRole('status');
    expect(panel).toHaveTextContent('Respuesta correcta.');
    expect(panel).toHaveTextContent('Explicación:');
    expect(panel).not.toHaveTextContent('Error frecuente');
    expect(panel).not.toHaveTextContent('Este fue el último intento');
  });

  it('no renderiza nada si el backend no envía retroalimentación', () => {
    renderPanel({ esCorrecta: false, numeroIntento: 1, retroalimentacion: null });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
