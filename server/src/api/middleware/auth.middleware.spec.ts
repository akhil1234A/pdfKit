import { Container } from 'inversify';
import { TYPES } from '../../di/types';
import { AuthMiddleware } from './auth.middleware';
import { CustomError } from '../../core/errors/custom-error';
import { CustomRequest } from '../../core/types/express';

describe('AuthMiddleware', () => {
  let container: Container;
  let authMiddleware: AuthMiddleware;

  beforeEach(() => {
    container = new Container();
    container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware);
    authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
    process.env.JWT_SECRET = 'test-secret';
  });

  it('should attach user to request with valid token', async () => {
    const req = { headers: { authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXIxIiwiaWF0IjoxNjAwMDAwMDAwfQ.3x8Z4z5x6x7x8x9x0x1x2x3x4x5x6x7x8x9x0x1x2x3' } } as CustomRequest;
    const res = {} as any;
    const next = jest.fn();

    await authMiddleware.verifyToken(req, res, next);

    expect(req.user).toEqual({ id: 'user1' });
    expect(next).toHaveBeenCalled();
  });

  it('should throw error for missing token', async () => {
    const req = { headers: {} } as CustomRequest;
    const res = {} as any;
    const next = jest.fn();

    await expect(authMiddleware.verifyToken(req, res, next)).rejects.toThrow(CustomError);
  });
});