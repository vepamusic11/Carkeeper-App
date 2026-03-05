import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { getUserSubscriptionStatus } from '../../helpers/revenueCatService.js';
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

describe('RevenueCat Service', () => {
  test('Debe retornar plan free para usuario sin suscripción', async () => {
    const usuario = new Usuario({
      nombre: 'Test',
      apellido: 'User',
      email: 'free@test.com',
      password: 'password'
    });
    await usuario.save();

    const status = await getUserSubscriptionStatus(usuario._id);

    expect(status.subscriptionType).toBe('free');
    expect(status.isSubscribed).toBe(false);
    expect(status.features.vehicleLimit).toBe(1);
  });

  test('Debe retornar plan PRO para usuario con isInvitado', async () => {
    const usuario = new Usuario({
      nombre: 'Pro',
      apellido: 'User',
      email: 'pro@test.com',
      password: 'password',
      isInvitado: true,
      proActivatedBy: 'easter_egg'
    });
    await usuario.save();

    const status = await getUserSubscriptionStatus(usuario._id);

    expect(status.subscriptionType).toBe('pro');
    expect(status.isSubscribed).toBe(true);
    expect(status.features.vehicleLimit).toBe(-1); // unlimited
    expect(status.grantedBy).toBe('easter_egg');
  });

  test('Debe retornar plan premium para usuario con subscriptionData premium', async () => {
    const usuario = new Usuario({
      nombre: 'Premium',
      apellido: 'User',
      email: 'premium@test.com',
      password: 'password',
      subscriptionData: {
        subscriptionType: 'premium',
        isSubscribed: true
      }
    });
    await usuario.save();

    const status = await getUserSubscriptionStatus(usuario._id);

    expect(status.subscriptionType).toBe('premium');
    expect(status.isSubscribed).toBe(true);
    expect(status.features.vehicleLimit).toBe(-1);
    expect(status.features.exportData).toBe(true);
  });

  test('Debe retornar free para usuario inexistente', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const status = await getUserSubscriptionStatus(fakeId);

    expect(status.subscriptionType).toBe('free');
    expect(status.isSubscribed).toBe(false);
  });

  test('Features de plan free deben ser correctos', async () => {
    const usuario = new Usuario({
      nombre: 'Test',
      apellido: 'Free',
      email: 'features-free@test.com',
      password: 'password'
    });
    await usuario.save();

    const status = await getUserSubscriptionStatus(usuario._id);

    expect(status.features).toEqual({
      vehicleLimit: 1,
      remindersLimit: 5,
      categoriesLimit: 3,
      backups: false,
      exportData: false,
      vehicleSharing: false,
      userInvitations: false,
      adsRemoved: false
    });
  });

  test('Features de plan pro deben incluir todas las funcionalidades', async () => {
    const usuario = new Usuario({
      nombre: 'Test',
      apellido: 'Pro',
      email: 'features-pro@test.com',
      password: 'password',
      isInvitado: true
    });
    await usuario.save();

    const status = await getUserSubscriptionStatus(usuario._id);

    expect(status.features.vehicleLimit).toBe(-1);
    expect(status.features.remindersLimit).toBe(-1);
    expect(status.features.backups).toBe(true);
    expect(status.features.exportData).toBe(true);
    expect(status.features.vehicleSharing).toBe(true);
    expect(status.features.userInvitations).toBe(true);
    expect(status.features.prioritySupport).toBe(true);
    expect(status.features.apiAccess).toBe(true);
  });
});
