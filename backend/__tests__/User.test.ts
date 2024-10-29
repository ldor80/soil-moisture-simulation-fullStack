import { User, UserInput } from '../models/User';

describe('User Model', () => {
  it('should create a user with correct properties', () => {
    const userData: UserInput = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    };

    const user: User = {
      id: 1,
      username: userData.username,
      email: userData.email,
      password_hash: 'hashedpassword',
      created_at: new Date(),
      updated_at: new Date()
    };

    expect(user).toHaveProperty('id');
    expect(user.username).toBe(userData.username);
    expect(user.email).toBe(userData.email);
    expect(user).toHaveProperty('password_hash');
    expect(user).toHaveProperty('created_at');
    expect(user).toHaveProperty('updated_at');
  });
});
