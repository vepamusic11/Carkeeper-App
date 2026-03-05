import { describe, test, expect, jest, beforeAll } from '@jest/globals';
import checkAuth from '../../middleware/checkAuth.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Mock de Usuario
const mockUsuario = {
  _id: '507f1f77bcf86cd799439011',
  nombre: 'Test',
  email: 'test@test.com'
};

// Mock del modelo Usuario
jest.unstable_mockModule('../../models/Usuario.js', () => ({
  default: {
    findById: jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUsuario)
    })
  }
}));

describe('Middleware checkAuth', () => {
  test('Debe rechazar petición sin header Authorization', async () => {
    const req = { headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await checkAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ msg: 'Token no válido' });
    expect(next).not.toHaveBeenCalled();
  });

  test('Debe rechazar petición con header Authorization sin Bearer', async () => {
    const req = {
      headers: {
        authorization: 'invalid-token'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await checkAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('Debe rechazar token JWT inválido', async () => {
    const req = {
      headers: {
        authorization: 'Bearer invalid-jwt-token'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await checkAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  test('Debe aceptar token JWT válido y llamar next()', async () => {
    // Generar un token válido
    const token = jwt.sign({ id: mockUsuario._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    const req = {
      headers: {
        authorization: `Bearer ${token}`
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await checkAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(req.usuario).toBeDefined();
  });

  test('Debe manejar token expirado correctamente', async () => {
    // Generar un token que expire inmediatamente
    const expiredToken = jwt.sign({ id: mockUsuario._id }, process.env.JWT_SECRET, {
      expiresIn: '0s'
    });

    // Esperar a que expire
    await new Promise(resolve => setTimeout(resolve, 100));

    const req = {
      headers: {
        authorization: `Bearer ${expiredToken}`
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    await checkAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      msg: {
        es: 'Sesion expirada, por favor vuelve a logearte',
        en: 'Session expired, please log in again'
      }
    });
    expect(next).not.toHaveBeenCalled();
  });
});
