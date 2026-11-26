import { createTheme, responsiveFontSizes } from '@mui/material/styles';

/**
 * Tema institucional de Aprendizaje USCO.
 *
 * Colores tomados del Manual de Identidad Visual de la Universidad Surcolombiana
 * (vino tinto, gris y ocre con sus variaciones). El prototipo HTML usaba un
 * vino muy cercano (#7a1f2b); aquí se usa el oficial (#8F141B).
 * Los colores de las 3 dimensiones del diagnóstico y los de estado
 * (éxito, error, advertencia, info) vienen del prototipo.
 *
 * Contraste verificado con la fórmula WCAG 2.1 (mínimo 4.5:1 para texto normal):
 *   blanco sobre primary.main (#8F141B) ........ 9.20:1
 *   primary.main sobre blanco (enlaces) ........ 9.20:1
 *   primary.main sobre fondo (#F9F6ED) ......... 8.51:1
 *   primary.main sobre ítem activo (#F4E7E8) ... 7.64:1
 *   texto (#1E262B) sobre fondo ................ 14.21:1
 *   texto secundario (#4D626C) sobre fondo ..... 5.93:1
 *   texto secundario sobre blanco .............. 6.40:1
 *   blanco sobre secondary.main (#4D626C) ...... 6.40:1
 *   blanco sobre primary.light (#B15B60) ....... 4.63:1 (usar solo en texto ≥ 14 px en negrita)
 *   dimensiones sobre blanco: algebraica 5.02, lógica 4.55, funcional 6.29
 *   estados sobre blanco: error 6.54, éxito 6.45, advertencia 4.75
 * Regla: NO usar ocre (#DFD4A6) ni gris claro como color de texto sobre blanco.
 */

const usco = {
  vino: { main: '#8F141B', light: '#B15B60', dark: '#5C0E12', 50: '#F4E7E8', 100: '#E3C5C6', 200: '#DDB8BA' },
  gris: { main: '#4D626C', light: '#839198', dark: '#1E262B', 100: '#DBE0E2', 50: '#EDEFF0', 300: '#A6B1B6' },
  ocre: { main: '#DFD4A6', light: '#EFEAD3', dark: '#C7B363', 50: '#F9F6ED' },
};

const DRAWER_ANCHO = 264;

let theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: usco.vino.main, light: usco.vino.light, dark: usco.vino.dark, contrastText: '#FFFFFF' },
    secondary: { main: usco.gris.main, light: usco.gris.light, dark: usco.gris.dark, contrastText: '#FFFFFF' },
    error: { main: '#B3261E', light: '#FDECEA', contrastText: '#FFFFFF' },
    success: { main: '#146C43', light: '#E9F5EE', contrastText: '#FFFFFF' },
    warning: { main: '#A1660A', light: '#FDF3E0', contrastText: '#FFFFFF' },
    info: { main: '#3F3A8F', light: '#EEECFB', contrastText: '#FFFFFF' },
    text: { primary: usco.gris.dark, secondary: usco.gris.main },
    background: { default: usco.ocre[50], paper: '#FFFFFF' },
    divider: usco.gris[100],
    // Colores propios (uso: theme.palette.dimension.algebraica o sx={{ color: 'dimension.logica' }})
    dimension: { algebraica: '#B45309', logica: '#00875A', funcional: '#4F46E5' },
    ocre: { main: usco.ocre.main, light: usco.ocre.light, dark: usco.ocre.dark, contrastText: usco.gris.dark },
    usco,
  },

  // Fuente institucional para web: Open Sans (se carga en main.jsx con @fontsource/open-sans).
  typography: {
    fontFamily: "'Open Sans', Arial, Helvetica, sans-serif",
    h1: { fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: '1.75rem', fontWeight: 700, lineHeight: 1.25 },
    h3: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.3 },
    h4: { fontSize: '1.375rem', fontWeight: 700, lineHeight: 1.3 },
    h5: { fontSize: '1.125rem', fontWeight: 600 },
    h6: { fontSize: '1rem', fontWeight: 600 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.55 },
    button: { fontWeight: 600, textTransform: 'none' },
  },

  shape: { borderRadius: 8 },

  // Mismos valores que MUI por defecto, explícitos para que se tenga a la vista.
  // El menú lateral pasa de cajón (móvil) a permanente desde "md" (900 px).
  breakpoints: { values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 } },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Foco visible en todo elemento navegable con teclado (WCAG 2.4.7).
        '*:focus-visible': { outline: `3px solid ${usco.vino.dark}`, outlineOffset: '2px' },
        // Sobre fondos vino (AppBar) el foco se ve en blanco.
        '.fondo-oscuro *:focus-visible': { outline: '3px solid #FFFFFF', outlineOffset: '2px' },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': { animationDuration: '0.01ms !important', transitionDuration: '0.01ms !important' },
        },
      },
    },
    // Los componentes de MUI quitan el outline por defecto; se restituye para foco con teclado.
    MuiButtonBase: {
      styleOverrides: {
        root: {
          '&.Mui-focusVisible': { outline: `3px solid ${usco.vino.dark}`, outlineOffset: '2px' },
          '.fondo-oscuro &.Mui-focusVisible': { outline: '3px solid #FFFFFF' },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { borderRadius: 8, paddingInline: 18, minHeight: 40 } },
    },
    MuiIconButton: {
      // Área táctil mínima de 44 px (WCAG 2.5.5 recomendado).
      styleOverrides: { root: { minWidth: 44, minHeight: 44 } },
    },
    // Enlaces siempre subrayados: no se distinguen solo por color (WCAG 1.4.1).
    MuiLink: { defaultProps: { underline: 'always', color: 'primary' } },
    MuiAppBar: { defaultProps: { color: 'primary', elevation: 0 } },
    MuiPaper: { styleOverrides: { outlined: { borderColor: usco.gris[100] } } },
    MuiCard: { defaultProps: { variant: 'outlined' } },
    MuiTextField: { defaultProps: { fullWidth: true } },
    // Con los "light" pálidos de la paleta, MUI pinta las alertas casi blancas y no se distingue
    // su tipo. Fondo claro + borde e icono del color, texto oscuro (≥ 12:1 en las cuatro).
    MuiAlert: {
      styleOverrides: {
        root: ({ theme: t, ownerState }) => {
          if (ownerState.variant !== 'standard') return {};
          const color = t.palette[ownerState.color || ownerState.severity || 'success'];
          return {
            backgroundColor: color.light,
            color: t.palette.text.primary,
            border: `1px solid ${color.main}`,
            '& .MuiAlert-icon': { color: color.main },
          };
        },
      },
    },
    // Las opciones de una pregunta ya respondida quedan deshabilitadas, pero el estudiante
    // las sigue leyendo: el gris por defecto (2.7:1) no cumple 4.5:1.
    MuiFormLabel: { styleOverrides: { root: { '&.Mui-disabled': { color: usco.gris.main } } } },
    MuiFormControlLabel: {
      styleOverrides: { label: { '&.Mui-disabled': { color: usco.gris.main } } },
    },
    // El texto de ayuda de un campo deshabilitado explica por qué lo está: debe leerse.
    MuiFormHelperText: { styleOverrides: { root: { '&.Mui-disabled': { color: usco.gris.main } } } },
  },
});

theme = responsiveFontSizes(theme);

export { DRAWER_ANCHO };
export default theme;
