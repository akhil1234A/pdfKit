import { Container } from 'inversify';
import { TYPES } from '../../di/types';
import { AuthService } from './auth.service';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserModel } from '../../domain/models/user.model';
import { CustomError } from '../../core/errors/custom-error';

describe('AuthService', () => {
  let container: Container;
  let authService: AuthService;
  let userRepository: UserRepository;

  beforeEach(() => {
    container = new Container();
    container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository);
    container.bind<AuthService>(TYPES.AuthService).to(AuthService);
    authService = container.get<AuthService>(TYPES.AuthService);
    userRepository = container.get<UserRepository>(TYPES.UserRepository);

    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const dto = { email: 'test@example.com', password: 'password123' };
      const result = await authService.register(dto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      const user = await UserModel.findOne({ email: dto.email });
      expect(user).toBeTruthy();
    });

    it('should throw error if user already exists', async () => {
      await UserModel.create({ email: 'test@example.com', password: 'hashed' });
      const dto = { email: 'test@example.com', password: 'password123' };

      await expect(authService.register(dto)).rejects.toThrow(CustomError);
    });
  });

  describe('login', () => {
    it('should login a user with valid credentials', async () => {
      const hashedPassword = await import('bcrypt').then((bcrypt) => bcrypt.hash('password123', 10));
      await UserModel.create({ email: 'test@example.com', password: hashedPassword });
      const dto = { email: 'test@example.com', password: 'password123' };

      const result = await authService.login(dto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw error for invalid credentials', async () => {
      const dto = { email: 'test@example.com', password: 'wrong' };
      await expect(authService.login(dto)).rejects.toThrow(CustomError);
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens', async () => {
      const user = await UserModel.create({ email: 'test@example.com', password: 'hashed' });
      const refreshToken = authService['generateRefreshToken'](user.id);

      const result = await authService.refreshToken(refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw error for invalid refresh token', async () => {
      await expect(authService.refreshToken('invalid')).rejects.toThrow(CustomError);
    });
  });
});