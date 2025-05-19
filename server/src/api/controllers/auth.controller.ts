import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { TYPES } from '../../di/types';
import { AuthService } from '../services/auth.service';
import { AuthDto } from '../../core/dtos/auth.dto';
import { validate } from '../../core/dtos/validate';
import { CustomError } from '../../core/errors/custom-error';

export class AuthController {
  constructor(@inject(TYPES.AuthService) private authService: AuthService) {}

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const tokens = await this.authService.register({ email, password });
      res.status(201).json({ message: 'User registered', ...tokens });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const tokens = await this.authService.login({ email, password });
      res.json({ message: 'Login successful', ...tokens });
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new CustomError('Refresh token required', 400);
      }
      const tokens = await this.authService.refreshToken(refreshToken);
      res.json({ message: 'Token refreshed', ...tokens });
    } catch (error) {
      next(error);
    }
  }
}