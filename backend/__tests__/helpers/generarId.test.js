import { describe, test, expect } from '@jest/globals';
import generarId from '../../helpers/generarId.js';

describe('generarId', () => {
  test('Debe generar un ID válido', () => {
    const id = generarId();

    expect(id).toBeDefined();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  test('Debe generar IDs únicos', () => {
    const ids = new Set();
    const iterations = 1000;

    for (let i = 0; i < iterations; i++) {
      ids.add(generarId());
    }

    // Todos los IDs deben ser únicos
    expect(ids.size).toBe(iterations);
  });

  test('ID debe tener formato alfanumérico', () => {
    const id = generarId();

    // Verificar que solo contenga caracteres alfanuméricos
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    expect(alphanumericRegex.test(id)).toBe(true);
  });

  test('Debe generar IDs de longitud consistente', () => {
    const id1 = generarId();
    const id2 = generarId();
    const id3 = generarId();

    expect(id1.length).toBe(id2.length);
    expect(id2.length).toBe(id3.length);
  });
});
