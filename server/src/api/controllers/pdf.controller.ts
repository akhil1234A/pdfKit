import { Request, Response, NextFunction } from 'express';
import { inject } from 'inversify';
import { TYPES } from '../../di/types';
import { PdfService } from '../services/pdf.service';
// import { AuthMiddleware } from '../middleware/auth.middleware';
// import { FileUploadMiddleware } from '../middleware/file-upload.middleware';
import { validate } from '../../core/dtos/validate';
import { ExtractDto } from '../../core/dtos/extract.dto';
import { CustomError } from '../../core/errors/custom-error';
import { CustomRequest } from '../../core/types/express';
import { Logger } from '../../infrastructure/logging/logger'

export class PdfController {
  constructor(@inject(TYPES.PdfService) private pdfService: PdfService) {}

  async upload(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      const userId = req.user?.id;
      Logger.info("file recieved for upload in backend");
      if (!file || !userId) {
        throw new CustomError('File and user ID required', 400);
      }
      Logger.info("file uploaded successfully");
      const result = await this.pdfService.uploadPdf(file, userId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMyFiles(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User ID required', 400);
      }
      const files = await this.pdfService.getUserPdfs(userId);
      res.json(files);
    } catch (error) {
      next(error);
    }
  }

  async getSignedUrl(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User ID required', 400);
      }
      const url = await this.pdfService.getSignedUrl(id, userId);
      res.json({ url });
    } catch (error) {
      next(error);
    }
  }

  async extractPages(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { pages } = req.body;
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError('User ID required', 400);
      }
      const result = await this.pdfService.extractPages(id, pages, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}