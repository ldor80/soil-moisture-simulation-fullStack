import db from '../db';
import { User, UserInput } from '../models/User';

/**
 * Development mode user service
 * In development, we use a default user (id: 1) for all operations
 */

export async function createUser(user: UserInput): Promise<User> {
  // In development mode, return default user without database operation
  return {
    id: 1,
    username: 'dev_user',
    email: 'dev@example.com',
    password_hash: 'dev_mode_no_hash',
    created_at: new Date(),
    updated_at: new Date()
  };
}

export async function getUserByUsername(username: string): Promise<User | null> {
  // In development mode, always return default user
  return {
    id: 1,
    username: 'dev_user',
    email: 'dev@example.com',
    password_hash: 'dev_mode_no_hash',
    created_at: new Date(),
    updated_at: new Date()
  };
}

export async function getUserByEmail(email: string): Promise<User | null> {
  // In development mode, always return default user
  return {
    id: 1,
    username: 'dev_user',
    email: 'dev@example.com',
    password_hash: 'dev_mode_no_hash',
    created_at: new Date(),
    updated_at: new Date()
  };
}
