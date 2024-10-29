import db from '../db';
import { User, UserInput } from '../models/User';
import bcrypt from 'bcrypt';

export async function createUser(user: UserInput): Promise<User> {
  const { username, email, password } = user;
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await db.query(
    'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
    [username, email, hashedPassword]
  );

  return result.rows[0];
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0] || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0] || null;
}
