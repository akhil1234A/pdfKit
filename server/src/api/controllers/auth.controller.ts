import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { TYPES } from '../../di/types';
import { AuthService } from '../services/auth.service';
import { AuthDto } from '../../core/dtos/auth.dto';
import { validate } from '../../core/dtos/validate';
import { CustomError } from '../../core/errors/custom-error';
import { STATUS_CODES, MESSAGES } from '@/core/constants/contants';

export class AuthController {
  constructor(@inject(TYPES.AuthService) private authService: AuthService) {}

  /**
   * This controller handles registration of a user
   * @param req email, password
   * @param res accessToken, refreshToken, user
   * @param next 
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const tokens = await this.authService.register({ email, password });
      res.status(STATUS_CODES.CREATED).json({ message: MESSAGES.REGISTER_SUCCESS, ...tokens });
    } catch (error) {
      next(error);
    }
  }

  /**
   * This controller handles login 
   * @param req email password
   * @param res accessToken, refreshToken, user
   * @param next 
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const tokens = await this.authService.login({ email, password });
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.LOGIN_SUCCESS, ...tokens });
    } catch (error) {
      next(error);
    }
  }

  /**
   * This method handles refresh token 
   * @param req refreshToken
   * @param res accessToken, refreshToken, user
   * @param next 
   */
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new CustomError(MESSAGES.REFRESH_TOKEN_REQUIRED, STATUS_CODES.BAD_REQUEST);
      }
      const tokens = await this.authService.refreshToken(refreshToken);
      res.status(STATUS_CODES.OK).json({ message: MESSAGES.REFRESH_SUCCESS, ...tokens });
    } catch (error) {
      next(error);
    }
  }
}