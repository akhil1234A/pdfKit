import { injectable, inject } from 'inversify';
import { TYPES } from '../../di/types';
import { PdfRepository } from '../../domain/repositories/pdf.repository';
import { S3Service } from '../../infrastructure/s3/s3.service';
import { CustomError } from '../../core/errors/custom-error';
import { PDFDocument } from 'pdf-lib';
import { Logger } from '../../infrastructure/logging/logger';

@injectable()
export class PdfService {
  constructor(
    @inject(TYPES.PdfRepository) private pdfRepository: PdfRepository,
    @inject(TYPES.S3Service) private s3Service: S3Service,
    @inject(TYPES.Logger) private logger: typeof Logger
  ) {}

  async uploadPdf(file: Express.Multer.File, userId: string) {
    const key = `pdfs/${userId}/${Date.now()}_${file.originalname}`;
    await this.s3Service.uploadFile(file.buffer, key, file.mimetype);

    const pdf = await this.pdfRepository.create({
      userId,
      fileName: file.originalname,
      s3Key: key,
      uploadDate: new Date(),
    });

    this.logger.info(`PDF uploaded: ${pdf.id} by user: ${userId}`);
    return { id: pdf.id, fileName: pdf.fileName, uploadDate: pdf.uploadDate };
  }

  async getUserPdfs(userId: string) {
    const pdfs = await this.pdfRepository.findByUserId(userId);
    return pdfs.map((pdf) => ({
      id: pdf.id,
      fileName: pdf.fileName,
      uploadDate: pdf.uploadDate,
    }));
  }

  async getSignedUrl(pdfId: string, userId: string) {
    const pdf = await this.pdfRepository.findById(pdfId);
    if (!pdf || pdf.userId !== userId) {
      throw new CustomError('PDF not found or unauthorized', 403);
    }

    const url = await this.s3Service.getSignedUrl(pdf.s3Key);
    this.logger.info(`Signed URL generated for PDF: ${pdfId}`);
    return url;
  }

  async extractPages(pdfId: string, pages: number[], userId: string) {
    const pdf = await this.pdfRepository.findById(pdfId);
    if (!pdf || pdf.userId !== userId) {
      throw new CustomError('PDF not found or unauthorized', 403);
    }

    const buffer = await this.s3Service.downloadFile(pdf.s3Key);
    const pdfDoc = await PDFDocument.load(buffer);
    const newPdfDoc = await PDFDocument.create();

    for (const pageNum of pages) {
      if (pageNum < 1 || pageNum > pdfDoc.getPageCount()) {
        throw new CustomError(`Invalid page number: ${pageNum}`, 400);
      }
      const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageNum - 1]);
      newPdfDoc.addPage(copiedPage);
    }

    const newPdfBytes = await newPdfDoc.save();
    const newKey = `pdfs/${userId}/extracted_${Date.now()}_${pdf.fileName}`;
    await this.s3Service.uploadFile(Buffer.from(newPdfBytes), newKey, 'application/pdf');

    const newPdf = await this.pdfRepository.create({
      userId,
      fileName: `extracted_${pdf.fileName}`,
      s3Key: newKey,
      uploadDate: new Date(),
      parentPdfId: pdfId,
    });

    const signedUrl = await this.s3Service.getSignedUrl(newKey);
    this.logger.info(`Pages extracted for PDF: ${pdfId}, new PDF: ${newPdf.id}`);
    return { id: newPdf.id, fileName: newPdf.fileName, url: signedUrl };
  }
}