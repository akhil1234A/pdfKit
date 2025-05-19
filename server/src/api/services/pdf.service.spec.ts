import { Container } from 'inversify';
import { TYPES } from '../../di/types';
import { PdfService } from './pdf.service';
import { PdfRepository } from '../../domain/repositories/pdf.repository';
import { S3Service } from '../../infrastructure/s3/s3.service';
import { Logger } from '../../infrastructure/logging/logger';
import { CustomError } from '../../core/errors/custom-error';
import { PDFDocument } from 'pdf-lib';

jest.mock('../infrastructure/s3/s3.service');
jest.mock('pdf-lib');

describe('PdfService', () => {
  let container: Container;
  let pdfService: PdfService;
  let pdfRepository: PdfRepository;
  let s3Service: S3Service;

  beforeEach(() => {
    container = new Container();
    container.bind<PdfRepository>(TYPES.PdfRepository).to(PdfRepository);
    container.bind<S3Service>(TYPES.S3Service).to(S3Service);
    container.bind<typeof Logger>(TYPES.Logger).toConstantValue(Logger);
    container.bind<PdfService>(TYPES.PdfService).to(PdfService);
    pdfService = container.get<PdfService>(TYPES.PdfService);
    pdfRepository = container.get<PdfRepository>(TYPES.PdfRepository);
    s3Service = container.get<S3Service>(TYPES.S3Service);
  });

  describe('uploadPdf', () => {
    it('should upload a PDF and save metadata', async () => {
      const file = { buffer: Buffer.from(''), originalname: 'test.pdf', mimetype: 'application/pdf' } as Express.Multer.File;
      const userId = 'user1';
      jest.spyOn(s3Service, 'uploadFile').mockResolvedValue(undefined);
      jest.spyOn(pdfRepository, 'create').mockResolvedValue({ id: 'pdf1', fileName: 'test.pdf', s3Key: 'key', uploadDate: new Date(), userId } as any);

      const result = await pdfService.uploadPdf(file, userId);

      expect(result).toHaveProperty('id', 'pdf1');
      expect(s3Service.uploadFile).toHaveBeenCalled();
    });
  });

  describe('extractPages', () => {
    it('should extract pages and save new PDF', async () => {
      const pdfId = 'pdf1';
      const userId = 'user1';
      const pages = [1];
      const pdf = { id: pdfId, userId, fileName: 'test.pdf', s3Key: 'key', uploadDate: new Date() };
      const buffer = Buffer.from('pdf');
      const pdfDoc = { getPageCount: jest.fn().mockReturnValue(1), copyPages: jest.fn().mockResolvedValue([{}]) };
      const newPdfDoc = { addPage: jest.fn(), save: jest.fn().mockResolvedValue(Buffer.from('new')) };

      jest.spyOn(pdfRepository, 'findById').mockResolvedValue(pdf as any);
      jest.spyOn(s3Service, 'downloadFile').mockResolvedValue(buffer);
      (PDFDocument.load as jest.Mock).mockResolvedValue(pdfDoc);
      (PDFDocument.create as jest.Mock).mockResolvedValue(newPdfDoc);
      jest.spyOn(s3Service, 'uploadFile').mockResolvedValue(undefined);
      jest.spyOn(s3Service, 'getSignedUrl').mockResolvedValue('signed-url');
      jest.spyOn(pdfRepository, 'create').mockResolvedValue({ id: 'pdf2', fileName: 'extracted_test.pdf', s3Key: 'new-key', uploadDate: new Date(), userId } as any);

      const result = await pdfService.extractPages(pdfId, pages, userId);

      expect(result).toHaveProperty('id', 'pdf2');
      expect(result).toHaveProperty('signedUrl', 'signed-url');
    });

    it('should throw error for invalid page number', async () => {
      const pdfId = 'pdf1';
      const userId = 'user1';
      const pages = [2];
      const pdf = { id: pdfId, userId, fileName: 'test.pdf', s3Key: 'key', uploadDate: new Date() };
      const buffer = Buffer.from('pdf');
      const pdfDoc = { getPageCount: jest.fn().mockReturnValue(1) };

      jest.spyOn(pdfRepository, 'findById').mockResolvedValue(pdf as any);
      jest.spyOn(s3Service, 'downloadFile').mockResolvedValue(buffer);
      (PDFDocument.load as jest.Mock).mockResolvedValue(pdfDoc);

      await expect(pdfService.extractPages(pdfId, pages, userId)).rejects.toThrow(CustomError);
    });
  });
});