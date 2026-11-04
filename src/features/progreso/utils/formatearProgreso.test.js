import { describe, expect, it } from 'vitest';
import {
  ESTADO_VARIACION,
  formatearNivel,
  formatearPorcentaje,
  formatearPuntosPorcentuales,
  NIVEL_ETIQUETAS,
} from './formatearProgreso';

describe('formatearProgreso utils', () => {
  describe('formatearNivel', () => {
    it('formatea INICIAL como Inicial', () => {
      expect(formatearNivel('INICIAL')).toBe('Inicial');
    });

    it('formatea BASICO como Básico', () => {
      expect(formatearNivel('BASICO')).toBe('Básico');
    });

    it('formatea INTERMEDIO como Intermedio', () => {
      expect(formatearNivel('INTERMEDIO')).toBe('Intermedio');
    });

    it('formatea AVANZADO como Avanzado', () => {
      expect(formatearNivel('AVANZADO')).toBe('Avanzado');
    });

    it('formatea explícitamente SIN_EVALUAR como Pendiente de evaluación', () => {
      expect(formatearNivel('SIN_EVALUAR')).toBe('Pendiente de evaluación');
    });

    it('formatea null y undefined como Pendiente de evaluación', () => {
      expect(formatearNivel(null)).toBe('Pendiente de evaluación');
      expect(formatearNivel(undefined)).toBe('Pendiente de evaluación');
      expect(formatearNivel('')).toBe('Pendiente de evaluación');
    });

    it('mantiene el valor original si es un valor desconocido', () => {
      expect(formatearNivel('OTRO_NIVEL')).toBe('OTRO_NIVEL');
    });
  });

  describe('formatearPorcentaje', () => {
    it('retorna Sin evaluar para null o undefined', () => {
      expect(formatearPorcentaje(null)).toBe('Sin evaluar');
      expect(formatearPorcentaje(undefined)).toBe('Sin evaluar');
    });

    it('redondea y formatea con símbolo de porcentaje', () => {
      expect(formatearPorcentaje(66.67)).toBe('67 %');
      expect(formatearPorcentaje(0)).toBe('0 %');
      expect(formatearPorcentaje('50')).toBe('50 %');
    });
  });

  describe('formatearPuntosPorcentuales', () => {
    it('retorna raya para null o undefined', () => {
      expect(formatearPuntosPorcentuales(null)).toBe('—');
      expect(formatearPuntosPorcentuales(undefined)).toBe('—');
    });

    it('agrega signo + para valores positivos y un decimal', () => {
      expect(formatearPuntosPorcentuales(5.23)).toBe('+5.2 pp');
    });

    it('mantiene signo negativo para retrocesos', () => {
      expect(formatearPuntosPorcentuales(-4.88)).toBe('-4.9 pp');
    });

    it('formatea 0 sin signo más', () => {
      expect(formatearPuntosPorcentuales(0)).toBe('0.0 pp');
    });
  });

  describe('ESTADO_VARIACION', () => {
    it('asigna color secondary con buen contraste a los estados pendientes', () => {
      expect(ESTADO_VARIACION.DIAGNOSTICO_PENDIENTE.color).toBe('secondary');
      expect(ESTADO_VARIACION.PRACTICA_PENDIENTE.color).toBe('secondary');
    });
  });
});

