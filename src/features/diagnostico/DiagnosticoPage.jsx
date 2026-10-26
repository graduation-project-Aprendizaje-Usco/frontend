/**
 * Prueba diagnóstica del estudiante (SCRUM-25): carga su intento y decide qué mostrar.
 *  - sin intento o EN_CURSO → instrucciones ("Comenzar" o "Continuar");
 *  - EN_CURSO tras pulsar el botón → la prueba;
 *  - FINALIZADO → su resultado (la prueba se presenta una sola vez).
 */
import { useEffect, useState } from 'react';
import { Alert } from '@mui/material';
import { actual, iniciar } from '../../api/diagnosticoApi';
import { mensajeDeError } from '../../api/errores';
import CargandoPagina from '../../components/CargandoPagina';
import InstruccionesDiagnostico from './InstruccionesDiagnostico';
import PruebaDiagnostico from './PruebaDiagnostico';
import ResultadoDiagnostico from './ResultadoDiagnostico';

export default function DiagnosticoPage() {
  const [intento, setIntento] = useState(undefined); // undefined = cargando; null = aún no la inicia
  const [respondiendo, setRespondiendo] = useState(false);
  const [iniciando, setIniciando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Diagnóstico · Aprendizaje USCO';
    actual()
      .then(setIntento)
      .catch((e) => setError(mensajeDeError(e, 'No pudimos cargar tu prueba. Recarga la página.')));
  }, []);

  // "Comenzar" y "Continuar" usan el mismo endpoint: si ya hay intento, el backend lo devuelve
  // con el tiempo restante al día.
  const comenzar = async () => {
    setIniciando(true);
    setError('');
    try {
      setIntento(await iniciar());
      setRespondiendo(true);
    } catch (e) {
      setError(mensajeDeError(e, 'No pudimos iniciar la prueba. Intenta de nuevo.'));
    } finally {
      setIniciando(false);
    }
  };

  if (error && intento === undefined) return <Alert severity="error">{error}</Alert>;
  if (intento === undefined) return <CargandoPagina />;

  if (intento?.estado === 'FINALIZADO') return <ResultadoDiagnostico resultado={intento.resultado} />;

  if (respondiendo) return <PruebaDiagnostico intento={intento} onFinalizada={setIntento} />;

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <InstruccionesDiagnostico enCurso={intento?.estado === 'EN_CURSO'} cargando={iniciando} onComenzar={comenzar} />
    </>
  );
}
