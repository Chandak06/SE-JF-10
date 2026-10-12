import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it
} from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Connection } from 'mongoose';
import mongoose from 'mongoose';

import { connectDatabase } from '../../src/db.js';
import { getUserModel } from '../../src/models/user.js';
import { createMongoAccountRepository } from '../../src/repositories/mongo-account-repository.js';

describe('Production User model and Mongo account repository', () => {
  let mongo: MongoMemoryServer;
  let connection: Connection;
  let User: ReturnType<typeof getUserModel>;
  let repository: ReturnType<typeof createMongoAccountRepository>;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create({
      instance: {
        dbName: 'csmq_user_repository_test',
        launchTimeout: 60_000
      }
    });

    connection = await connectDatabase(mongo.getUri());
    User = getUserModel(connection);
    repository = createMongoAccountRepository(connection);
  }, 90_000);

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await connection?.close();
    await mongo?.stop();
  });

  describe('User model', () => {
    it('applies defaults and normalizes email', async () => {
      const user = await User.create({
        name: '  Test Student  ',
        email: '  STUDENT@EXAMPLE.COM  ',
        passwordHash: 'test-hash'
      });

      expect(user.name).toBe('Test Student');
      expect(user.email).toBe('student@example.com');
      expect(user.role).toBe('student');
      expect(user.active).toBe(true);
    });

    it('rejects a user with missing required fields', async () => {
      const user = new User({});

      const error = user.validateSync();

      expect(error).toBeDefined();
      expect(error?.errors.name).toBeDefined();
      expect(error?.errors.email).toBeDefined();
      expect(error?.errors.passwordHash).toBeDefined();
    });

    it('rejects a role outside the allowed values', async () => {
      const user = new User({
        name: 'Test Student',
        email: 'student@example.com',
        passwordHash: 'test-hash',
        role: 'superuser'
      });

      const error = user.validateSync();

      expect(error?.errors.role).toBeDefined();
    });

    it('hides passwordHash in ordinary queries', async () => {
      await User.create({
        name: 'Test Student',
        email: 'student@example.com',
        passwordHash: 'test-hash'
      });

      const user = await User.findOne({
        email: 'student@example.com'
      }).exec();

      expect(user).not.toBeNull();
      expect(user?.passwordHash).toBeUndefined();

      const withHash = await User.findOne({
        email: 'student@example.com'
      })
        .select('+passwordHash')
        .exec();

      expect(withHash?.passwordHash).toBe('test-hash');
    });

    it('reuses the model registered on the same connection', () => {
      expect(getUserModel(connection)).toBe(User);
    });
  });

  describe('Mongo account repository', () => {
    it('initializes the User model and indexes', async () => {
      await repository.initialize();

      const indexes = await User.collection.indexes();

      expect(indexes.some((index) => index.unique === true)).toBe(true);
    });

    it('finds an account by ID, including its password hash', async () => {
      const user = await User.create({
        name: 'Test Student',
        email: 'student@example.com',
        passwordHash: 'test-hash'
      });

      const account = await repository.accounts.findById(user.id);

      expect(account).toMatchObject({
        id: user.id,
        name: 'Test Student',
        email: 'student@example.com',
        passwordHash: 'test-hash',
        role: 'student',
        active: true
      });
    });

    it('returns null for an unknown ID', async () => {
      const account = await repository.accounts.findById(
        new mongoose.Types.ObjectId().toString()
      );

      expect(account).toBeNull();
    });

    it('finds accounts using a trimmed, case-insensitive email', async () => {
      await User.create({
        name: 'Test Student',
        email: 'student@example.com',
        passwordHash: 'test-hash'
      });

      const account =
        await repository.accounts.findByEmail('  STUDENT@EXAMPLE.COM  ');

      expect(account?.email).toBe('student@example.com');
      expect(account?.passwordHash).toBe('test-hash');
    });

    it('returns null for an unknown email', async () => {
      const account =
        await repository.accounts.findByEmail('missing@example.com');

      expect(account).toBeNull();
    });

    it('creates a student with a trimmed name and normalized email', async () => {
      const account = await repository.accounts.createStudent({
        name: '  New Student  ',
        email: '  NEW.STUDENT@EXAMPLE.COM  ',
        passwordHash: 'new-hash'
      });

      expect(account).toMatchObject({
        name: 'New Student',
        email: 'new.student@example.com',
        passwordHash: 'new-hash',
        role: 'student',
        active: true
      });

      const storedUser = await User.findById(account.id)
        .select('+passwordHash')
        .exec();

      expect(storedUser).not.toBeNull();
      expect(storedUser?.email).toBe('new.student@example.com');
    });
  });
});
