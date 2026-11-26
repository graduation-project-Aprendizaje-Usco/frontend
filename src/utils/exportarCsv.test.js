import { describe, expect, it } from 'vitest';
import { serializarCsvExcel } from './exportarCsv';

describe('serializarCsvExcel', () => {
  it('genera CSV compatible con Excel, escapa comillas y neutraliza fórmulas', () => {
    const csv = serializarCsvExcel(
      ['Estudiante', 'Intentos'],
      [['=HYPERLINK("malicioso")', 2]],
    );

    expect(csv).toBe('\uFEFF"Estudiante";"Intentos"\r\n"\'=HYPERLINK(""malicioso"")";2');
  });
});
