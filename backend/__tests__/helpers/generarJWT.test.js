import { describe, test, expect, beforeAll } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { generarJWT } from '../../helpers/generarJWT.js';
import dotenv from 'dotenv';

dotenv.config();

describe('generarJWT', () => {
  test('Debe generar un token JWT válido', () => {
    const userId = '507f1f77bcf86cd799439011';
    const token = generarJWT(userId);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT tiene 3 partes
  });

  test('Token debe contener el ID del usuario', () => {
    const userId = '507f1f77bcf86cd799439011';
    const token = generarJWT(userId);

    // Decodificar sin verificar (solo para testing)
    const decoded = jwt.decode(token);

    expect(decoded).toBeDefined();
    expect(decoded.id).toBe(userId);
  });

  test('Token debe ser verificable con JWT_SECRET', () => {
    const userId = '507f1f77bcf86cd799439011';
    const token = generarJWT(userId);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded.id).toBe(userId);
  });

  test('Token debe tener fecha de expiración', () => {
    const userId = '507f1f77bcf86cd799439011';
    const token = generarJWT(userId);

    const decoded = jwt.decode(token);

    expect(decoded.exp).toBeDefined();
    expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  test('Tokens diferentes para el mismo usuario deben ser diferentes', () => {
    const userId = '507f1f77bcf86cd799439011';
    const token1 = generarJWT(userId);
    const token2 = generarJWT(userId);

    // Aunque son para el mismo usuario, deben ser diferentes porque
    // tienen diferentes timestamps (iat)
    expect(token1).not.toBe(token2);
  });
});
