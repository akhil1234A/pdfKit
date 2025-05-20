import request from 'supertest';
import express from 'express';
import { Container } from 'inversify';
import { configureDI } from '../../di/container';
import { AuthRoutes } from '../routes/auth.routes';
import { UserModel } from '../../domain/models/user.model';
import { AuthService } from '../services/auth.service';
import { TYPES } from '../../di/types';
import { jest } from '@jest/globals';
import { validate } from '../../core/dtos/validate';

jest.mock('../../core/dtos/validate');
jest.mock('../services/auth.service');

describe('AuthController', () => {
  let app: express.Application;
  let container: Container;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    container = configureDI();
    authService = container.get<AuthService>(TYPES.AuthService) as jest.Mocked<AuthService>;
    app = express();
    app.use(express.json());
    const authRoutes = container.get<AuthRoutes>(AuthRoutes);
    app.use('/api/auth', authRoutes.router);
    await UserModel.deleteMany({});
    (validate as jest.Mock).mockImplementation((dto, schema) => dto);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/auth/register should register a new user', async () => {
    const mockTokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: 'user123', email: 'test@example.com' },
    };
    authService.register.mockResolvedValue(mockTokens);

    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(201);

    expect(response.body).toEqual({ message: 'User registered', ...mockTokens });
    expect(authService.register).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
    const user = await UserModel.findOne({ email: 'test@example.com' });
    expect(user).toBeNull(); // No real DB call due to mock
  });

  

  it('POST /api/auth/login should login a user', async () => {
    const mockTokens = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { id: 'user123', email: 'test@example.com' },
    };
    authService.login.mockResolvedValue(mockTokens);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(200);

    expect(response.body).toEqual({ message: 'Login successful', ...mockTokens });
    expect(authService.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
  });

  

  it('POST /api/auth/refresh should refresh tokens', async () => {
    const mockTokens = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      user: { id: 'user123', email: 'test@example.com' },
    };
    authService.refreshToken.mockResolvedValue(mockTokens);

    const response = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'valid-refresh-token' })
      .expect(200);

    expect(response.body).toEqual({ message: 'Token refreshed', ...mockTokens });
    expect(authService.refreshToken).toHaveBeenCalledWith('valid-refresh-token');
  });

  
});