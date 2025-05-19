import request from 'supertest';
import express from 'express';
import { Container } from 'inversify';
import { configureDI } from '../../di/container';
import { AuthRoutes } from '../routes/auth.routes';
import { UserModel } from '../../domain/models/user.model';
import { AuthService } from '../services/auth.service';
import { TYPES } from "../../di/types"

describe('AuthController', () => {
  let app: express.Application;
  let container: Container;

  beforeEach(async () => {
    container = configureDI();
    app = express();
    app.use(express.json());
    const authRoutes = container.get<AuthRoutes>(AuthRoutes);
    app.use('/api/auth', authRoutes.router);
    await UserModel.deleteMany({});
  });

  it('POST /api/auth/register should register a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    const user = await UserModel.findOne({ email: 'test@example.com' });
    expect(user).toBeTruthy();
  });

  it('POST /api/auth/login should login a user', async () => {
    const hashedPassword = await import('bcrypt').then((bcrypt) => bcrypt.hash('password123', 10));
    await UserModel.create({ email: 'test@example.com', password: hashedPassword });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });

  it('POST /api/auth/refresh should refresh tokens', async () => {
    const user = await UserModel.create({ email: 'test@example.com', password: 'hashed' });
    const refreshToken = container.get<AuthService>(TYPES.AuthService)['generateRefreshToken'](user.id);

    const response = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
  });
});