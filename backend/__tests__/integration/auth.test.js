import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Usuario from '../../models/Usuario.js';
import { generarJWT } from '../../helpers/generarJWT.js';
import jwt from 'jsonwebtoken';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Usuario.deleteMany({});
});

describe('Flujo de Autenticación Completo', () => {
  test('Debe registrar un usuario, autenticarlo y verificar el token', async () => {
    // 1. Registrar usuario
    const usuarioData = {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez@test.com',
      password: 'Password123!',
    };

    const usuario = new Usuario(usuarioData);
    await usuario.save();

    expect(usuario._id).toBeDefined();
    expect(usuario.password).not.toBe(usuarioData.password); // Debe estar hasheada

    // 2. Autenticar (verificar password)
    const isPasswordValid = await usuario.comprobarPassword('Password123!');
    expect(isPasswordValid).toBe(true);

    // 3. Generar token JWT
    const token = generarJWT(usuario._id.toString());
    expect(token).toBeDefined();

    // 4. Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(usuario._id.toString());
  });

  test('Debe fallar al autenticar con password incorrecta', async () => {
    const usuario = new Usuario({
      nombre: 'Test',
      apellido: 'User',
      email: 'test@example.com',
      password: 'CorrectPassword123',
    });

    await usuario.save();

    const isPasswordValid = await usuario.comprobarPassword('WrongPassword');
    expect(isPasswordValid).toBe(false);
  });

  test('Debe manejar registro con Google (sin password)', async () => {
    const usuario = new Usuario({
      nombre: 'Google',
      apellido: 'User',
      email: 'google@test.com',
      provider: 'google',
      providerId: 'google-id-12345',
    });

    await usuario.save();

    expect(usuario._id).toBeDefined();
    expect(usuario.provider).toBe('google');
    expect(usuario.providerId).toBe('google-id-12345');
    expect(usuario.password).toBeUndefined();
  });

  test('Debe manejar registro con Apple', async () => {
    const usuario = new Usuario({
      nombre: 'Apple',
      apellido: 'User',
      email: 'apple@test.com',
      provider: 'apple',
      providerId: 'apple-id-67890',
    });

    await usuario.save();

    expect(usuario._id).toBeDefined();
    expect(usuario.provider).toBe('apple');
  });

  test('Debe actualizar lastLogin al autenticar', async () => {
    const usuario = new Usuario({
      nombre: 'Test',
      apellido: 'Login',
      email: 'login@test.com',
      password: 'password123',
    });

    await usuario.save();
    const loginBefore = usuario.lastLogin;

    // Simular login actualizando lastLogin
    usuario.lastLogin = new Date();
    await usuario.save();

    expect(usuario.lastLogin).not.toBe(loginBefore);
    expect(usuario.lastLogin).toBeInstanceOf(Date);
  });

  test('Debe almacenar token de notificación correctamente', async () => {
    const usuario = new Usuario({
      nombre: 'Test',
      apellido: 'Notification',
      email: 'notification@test.com',
      password: 'password123',
    });

    await usuario.save();

    usuario.tokenNotification = 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]';
    usuario.allowNotifications = true;
    await usuario.save();

    expect(usuario.tokenNotification).toBe('ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]');
    expect(usuario.allowNotifications).toBe(true);
  });

  test('Debe validar estructura de subscriptionData', async () => {
    const subscriptionData = {
      subscriptionType: 'pro',
      isSubscribed: true,
      customerInfo: {
        originalAppUserId: 'user-123',
        firstSeen: new Date(),
      }
    };

    const usuario = new Usuario({
      nombre: 'Pro',
      apellido: 'User',
      email: 'pro@test.com',
      password: 'password123',
      subscriptionData,
    });

    await usuario.save();

    expect(usuario.subscriptionData).toBeDefined();
    expect(usuario.subscriptionData.subscriptionType).toBe('pro');
    expect(usuario.subscriptionData.isSubscribed).toBe(true);
  });
});
