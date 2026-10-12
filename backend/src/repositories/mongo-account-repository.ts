import { Types, type Connection } from 'mongoose';
import type { Account, AccountRepository } from '../types/security.js';
import { getUserModel, type UserDocument } from '../models/user.js';

export function createMongoAccountRepository(connection: Connection) {
  const User = getUserModel(connection);

  function toAccount(user: UserDocument): Account {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
      active: user.active
    };
  }

  const accounts: AccountRepository = {
    async findById(id) {
      if (!Types.ObjectId.isValid(id)) return null;
      const user = await User.findById(id)
        .select('+passwordHash')
        .exec();

      return user ? toAccount(user) : null;
    },

    async findByEmail(email) {
      const normalizedEmail = email.trim().toLowerCase();

      const user = await User.findOne({ email: normalizedEmail })
        .select('+passwordHash')
        .exec();

      return user ? toAccount(user) : null;
    },

    async createStudent(input) {
      const user = await User.create({
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        passwordHash: input.passwordHash,
        role: 'student'
      });

      return toAccount(user);
    }
  };

  return {
    accounts,
    User,
    async initialize() {
      await User.init();
    }
  };
}
