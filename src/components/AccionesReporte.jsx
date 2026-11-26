import { Button, Stack } from '@mui/material';
import FileDownloadOutlined from '@mui/icons-material/FileDownloadOutlined';
import PictureAsPdfOutlined from '@mui/icons-material/PictureAsPdfOutlined';
import { descargarCsvExcel } from '../utils/exportarCsv';

export default function AccionesReporte({ nombreArchivo, columnas, filas, deshabilitado = false }) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1}
      data-print-hide
      sx={{ '@media print': { display: 'none' } }}
    >
      <Button
        variant="outlined"
        startIcon={<FileDownloadOutlined />}
        disabled={deshabilitado}
        onClick={() => descargarCsvExcel(nombreArchivo, columnas, filas)}
      >
        Exportar Excel (CSV)
      </Button>
      <Button
        variant="contained"
        startIcon={<PictureAsPdfOutlined />}
        disabled={deshabilitado}
        onClick={() => window.print()}
      >
        Imprimir / guardar PDF
      </Button>
    </Stack>
  );
}
