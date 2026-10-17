import { Schema, type Connection, type HydratedDocument, type Model } from 'mongoose';
import type { Role } from '../types/security.js';

export interface UserFields {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  active: boolean;
}

const userSchema = new Schema<UserFields>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
      match: /^[^<>\x00-\x1f\x7f]+$/
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/,
      unique: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
      match: /^\$2[aby]\$(10|11|12|13|14)\$[./A-Za-z0-9]{53}$/
    },
    role: {
      type: String,
      enum: ['student', 'admin'],
      required: true,
      default: 'student'
    },
    active: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  {
    timestamps: true,
    versionKey: false,
    strict: 'throw'
  }
);

export type UserDocument = HydratedDocument<UserFields>;

export function getUserModel(connection: Connection): Model<UserFields> {
  return (
    (connection.models.User as Model<UserFields> | undefined) ??
    connection.model<UserFields>('User', userSchema)
  );
}
