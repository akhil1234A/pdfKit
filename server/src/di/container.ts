import { Container } from 'inversify';
import { TYPES } from './types';
import { AuthService } from '../api/services/auth.service';
import { PdfService } from '../api/services/pdf.service';
import { UserRepository } from '../domain/repositories/user.repository';
import { PdfRepository } from '../domain/repositories/pdf.repository';
import { S3Service } from '../infrastructure/s3/s3.service';
import { Logger } from '../infrastructure/logging/logger';
import { AuthRoutes } from '../api/routes/auth.routes';
import { PdfRoutes } from '../api/routes/pdf.routes';
import { AuthController } from '../api/controllers/auth.controller';
import { PdfController } from '../api/controllers/pdf.controller';
import { AuthMiddleware } from '../api/middleware/auth.middleware';
import { FileUploadMiddleware } from '../api/middleware/file-upload.middleware';
import { ErrorMiddleware } from '../api/middleware/error.middleware';

export function configureDI(): Container {
  const container = new Container();

  // Services
  container.bind<AuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();
  container.bind<PdfService>(TYPES.PdfService).to(PdfService).inSingletonScope();
  container.bind<S3Service>(TYPES.S3Service).to(S3Service).inSingletonScope();
  container.bind<typeof Logger>(TYPES.Logger).toConstantValue(Logger);

  // Repositories
  container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();
  container.bind<PdfRepository>(TYPES.PdfRepository).to(PdfRepository).inSingletonScope();

  // Controllers
  container.bind<AuthController>(TYPES.AuthController).to(AuthController).inSingletonScope();
  container.bind<PdfController>(TYPES.PdfController).to(PdfController).inSingletonScope();

  // Routes
  container.bind<AuthRoutes>(AuthRoutes).to(AuthRoutes).inSingletonScope();
  container.bind<PdfRoutes>(PdfRoutes).to(PdfRoutes).inSingletonScope();

  // Middleware
  container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware).inSingletonScope();
  container.bind<FileUploadMiddleware>(TYPES.FileUploadMiddleware).to(FileUploadMiddleware).inSingletonScope();
  container.bind<ErrorMiddleware>(TYPES.ErrorMiddleware).to(ErrorMiddleware).inSingletonScope();

  return container;
}