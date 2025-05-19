import express, { Application } from 'express';
import { Container } from 'inversify';
import { configureDI } from './di/container';
import { AuthRoutes } from './api/routes/auth.routes';
import { PdfRoutes } from './api/routes/pdf.routes';
import { Logger } from './infrastructure/logging/logger';
import morgan from './infrastructure/logging/morgan';
import { ErrorMiddleware } from './api/middleware/error.middleware';
import { connectToDatabase } from './infrastructure/database/connection';
import { TYPES } from './di/types'
import cors from 'cors'
import * as dotenv from 'dotenv'

dotenv.config();
export class App {
  private app: Application;
  private container: Container;

  constructor() {
    this.app = express();
    this.container = configureDI();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddleware() {
    this.app.use(express.json());
    this.app.use(morgan);
    this.app.use(
    cors({
      origin: 'http://localhost:5173',
      credentials: true,
    })
  );
  }

  private configureRoutes() {
    const authRoutes = this.container.get<AuthRoutes>(AuthRoutes);
    const pdfRoutes = this.container.get<PdfRoutes>(PdfRoutes);
    this.app.use('/api/auth', authRoutes.router);
    this.app.use('/api/pdf', pdfRoutes.router);
  }

  private configureErrorHandling() {
  const errorMiddleware = this.container.get<ErrorMiddleware>(TYPES.ErrorMiddleware);
  this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    errorMiddleware.handle(err, req, res, next);
  });
}

  public async start(port: number | string): Promise<void> {
    await connectToDatabase();
    return new Promise((resolve) => {
      this.app.listen(port, () => {
        resolve();
      });
    });
  }
}