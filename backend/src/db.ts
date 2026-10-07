import mongoose, { type Connection } from 'mongoose';

export async function connectDatabase(uri: string): Promise<Connection> {
  const connection = mongoose.createConnection(uri, {
    serverSelectionTimeoutMS: 5_000,
    maxPoolSize: 10,
    autoIndex: true
  });
  try {
    return await connection.asPromise();
  } catch {
    await connection.close();
    throw new Error('Unable to connect to MongoDB. Check its availability and configuration.');
  }
}
