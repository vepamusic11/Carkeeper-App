import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Usuario from '../../models/Usuario.js';

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

describe('Modelo Usuario', () => {
  test('Debe crear un usuario válido', async () => {
    const usuarioData = {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@test.com',
      password: 'password123',
    };

    const usuario = new Usuario(usuarioData);
    const usuarioGuardado = await usuario.save();

    expect(usuarioGuardado._id).toBeDefined();
    expect(usuarioGuardado.nombre).toBe('Juan');
    expect(usuarioGuardado.email).toBe('juan@test.com');
    expect(usuarioGuardado.role).toBe('user'); // default value
  });

  test('Debe hashear la contraseña antes de guardar', async () => {
    const usuario = new Usuario({
      nombre: 'Test',
      apellido: 'User',
      email: 'test@test.com',
      password: 'plainPassword',
    });

    await usuario.save();

    expect(usuario.password).not.toBe('plainPassword');
    expect(usuario.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash pattern
  });

  test('Debe validar contraseña correctamente', async () => {
    const usuario = new Usuario({
      nombre: 'Test',
      apellido: 'User',
      email: 'validate@test.com',
      password: 'myPassword123',
    });

    await usuario.save();

    const isValid = await usuario.comprobarPassword('myPassword123');
    const isInvalid = await usuario.comprobarPassword('wrongPassword');

    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });

  test('No debe hashear la contraseña si no fue modificada', async () => {
    const usuario = new Usuario({
      nombre: 'Test',
      apellido: 'User',
      email: 'nohash@test.com',
      password: 'password123',
    });

    await usuario.save();
    const hashedPassword = usuario.password;

    // Modificar otro campo
    usuario.nombre = 'Updated';
    await usuario.save();

    // La contraseña debe seguir siendo la misma
    expect(usuario.password).toBe(hashedPassword);
  });

  test('Email debe ser único', async () => {
    const email = 'unique@test.com';

    const usuario1 = new Usuario({
      nombre: 'User',
      apellido: 'One',
      email: email,
      password: 'password1',
    });
    await usuario1.save();

    const usuario2 = new Usuario({
      nombre: 'User',
      apellido: 'Two',
      email: email,
      password: 'password2',
    });

    await expect(usuario2.save()).rejects.toThrow();
  });

  test('Debe tener valores por defecto correctos', async () => {
    const usuario = new Usuario({
      nombre: 'Test',
      apellido: 'User',
      email: 'defaults@test.com',
      password: 'password',
    });

    await usuario.save();

    expect(usuario.role).toBe('user');
    expect(usuario.provider).toBe('local');
    expect(usuario.allowNotifications).toBe(false);
    expect(usuario.lengua).toBe('en');
    expect(usuario.isInvitado).toBe(false);
    expect(usuario.settings).toBeDefined();
    expect(usuario.settings.language).toBe('es');
  });
});
