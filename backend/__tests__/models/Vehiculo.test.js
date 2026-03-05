import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Vehiculo from '../../models/Vehiculo.js';
import Usuario from '../../models/Usuario.js';

let mongoServer;
let testUserId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Crear un usuario de prueba
  const usuario = new Usuario({
    nombre: 'Test',
    apellido: 'User',
    email: 'test@vehiculo.com',
    password: 'password',
  });
  const savedUser = await usuario.save();
  testUserId = savedUser._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Vehiculo.deleteMany({});
});

describe('Modelo Vehiculo', () => {
  test('Debe crear un vehículo válido', async () => {
    const vehiculoData = {
      userId: testUserId,
      marca: 'Toyota',
      modelo: 'Corolla',
      ano: 2020,
      patente: 'ABC123',
      color: 'Rojo',
    };

    const vehiculo = new Vehiculo(vehiculoData);
    const vehiculoGuardado = await vehiculo.save();

    expect(vehiculoGuardado._id).toBeDefined();
    expect(vehiculoGuardado.marca).toBe('Toyota');
    expect(vehiculoGuardado.modelo).toBe('Corolla');
    expect(vehiculoGuardado.ano).toBe(2020);
  });

  test('Debe tener valores por defecto correctos', async () => {
    const vehiculo = new Vehiculo({
      userId: testUserId,
      marca: 'Ford',
      modelo: 'Focus',
    });

    await vehiculo.save();

    expect(vehiculo.kilometraje).toBe(0);
    expect(vehiculo.combustible).toBe('gasolina');
    expect(vehiculo.transmision).toBe('manual');
    expect(vehiculo.isActive).toBe(true);
    expect(vehiculo.sharedWith).toEqual([]);
  });

  test('Debe validar enum de combustible', async () => {
    const vehiculo = new Vehiculo({
      userId: testUserId,
      marca: 'Honda',
      modelo: 'Civic',
      combustible: 'nuclear', // valor inválido
    });

    await expect(vehiculo.save()).rejects.toThrow();
  });

  test('Debe validar enum de transmisión', async () => {
    const vehiculo = new Vehiculo({
      userId: testUserId,
      marca: 'Mazda',
      modelo: '3',
      transmision: 'semiauto', // valor inválido
    });

    await expect(vehiculo.save()).rejects.toThrow();
  });

  test('Debe requerir userId', async () => {
    const vehiculo = new Vehiculo({
      marca: 'Chevrolet',
      modelo: 'Spark',
    });

    await expect(vehiculo.save()).rejects.toThrow();
  });

  test('Debe permitir agregar usuarios compartidos', async () => {
    const vehiculo = new Vehiculo({
      userId: testUserId,
      marca: 'Nissan',
      modelo: 'Sentra',
      sharedWith: [{
        userId: testUserId,
        role: 'editor',
        invitedBy: testUserId,
        status: 'pending'
      }]
    });

    const saved = await vehiculo.save();

    expect(saved.sharedWith).toHaveLength(1);
    expect(saved.sharedWith[0].role).toBe('editor');
    expect(saved.sharedWith[0].status).toBe('pending');
  });

  test('Configuración de sharing debe tener valores por defecto', async () => {
    const vehiculo = new Vehiculo({
      userId: testUserId,
      marca: 'Kia',
      modelo: 'Rio',
    });

    await vehiculo.save();

    expect(vehiculo.sharingSettings).toBeDefined();
    expect(vehiculo.sharingSettings.allowExpenseEditing).toBe(true);
    expect(vehiculo.sharingSettings.allowMaintenanceEditing).toBe(true);
    expect(vehiculo.sharingSettings.allowDocumentUploads).toBe(false);
    expect(vehiculo.sharingSettings.allowVehicleEditing).toBe(false);
  });
});
