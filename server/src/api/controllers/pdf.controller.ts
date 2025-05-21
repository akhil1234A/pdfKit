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
import { MESSAGES, STATUS_CODES } from '../../core/constants/contants';

export class PdfController {
  constructor(@inject(TYPES.PdfService) private pdfService: PdfService) {}

  /**
   * This method handles the upload of the pdf document
   * @param req file
   * @param req userId
   * @param res 
   * @param next uploadPdf
   */
  async upload(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      const userId = req.user?.id;
      Logger.info("file recieved for upload in backend");
      if (!file || !userId) {
        throw new CustomError(MESSAGES.FILE_USER_ID_REQUIRED, STATUS_CODES.BAD_REQUEST);
      }
      Logger.info("file uploaded successfully");
      const result = await this.pdfService.uploadPdf(file, userId);
      res.status(STATUS_CODES.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * This method to get all the files of the user
   * @param req userId
   * @param res Array of pdfs
   * @param next 
   */
  async getMyFiles(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError(MESSAGES.USER_ID_REQUIRED, STATUS_CODES.BAD_REQUEST);
      }
      const files = await this.pdfService.getUserPdfs(userId);
      res.status(STATUS_CODES.OK).json(files);
    } catch (error) {
      next(error);
    }
  }

/**
 * This method gets the single pdf
 * @param req id userId
 * @param res 
 * @param next 
 */
  async getSignedUrl(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError(MESSAGES.USER_ID_REQUIRED, STATUS_CODES.BAD_REQUEST);
      }
      const url = await this.pdfService.getSignedUrl(id, userId);
      res.status(STATUS_CODES.OK).json({ url });
    } catch (error) {
      next(error);
    }
  }

  /**
   * This method extract pages and create new pdf
   * @param req id userId
   * @param req pages
   * @param res 
   * @param next 
   */
  async extractPages(req: CustomRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { pages } = req.body;
      const userId = req.user?.id;
      if (!userId) {
        throw new CustomError(MESSAGES.USER_ID_REQUIRED, STATUS_CODES.BAD_REQUEST);
      }
      const result = await this.pdfService.extractPages(id, pages, userId);
      res.status(STATUS_CODES.OK).json(result);
    } catch (error) {
      next(error);
    }
  }
}