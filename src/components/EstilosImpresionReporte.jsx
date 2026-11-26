import GlobalStyles from '@mui/material/GlobalStyles';

export default function EstilosImpresionReporte() {
  return (
    <GlobalStyles
      styles={{
        '@media print': {
          'header': { display: 'none !important' },
          'nav[aria-label="Menú principal"]': { display: 'none !important' },
          'main#contenido-principal': {
            width: '100% !important',
            margin: '0 !important',
            padding: '0 !important',
          },
          'main#contenido-principal > .MuiToolbar-root': { display: 'none !important' },
          '@page': { margin: '12mm' },
        },
      }}
    />
  );
}
