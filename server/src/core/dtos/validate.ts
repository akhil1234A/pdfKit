import { Request, Response, NextFunction } from 'express';
import { plainToClass } from 'class-transformer';
import { validate as classValidate } from 'class-validator';
import { CustomError } from '../errors/custom-error';

export function validate<T extends object>(type: new () => T) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToClass(type, req.body);
    const errors = await classValidate(dto);

    if (errors.length > 0) {
      const messages = errors.map((err) => Object.values(err.constraints || {})).flat();
      throw new CustomError(messages.join(', '), 400);
    }

    req.body = dto;
    next();
  };
}
