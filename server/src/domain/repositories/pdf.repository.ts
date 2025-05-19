import { injectable } from 'inversify';
import { PdfModel, IPdf } from '../models/pdf.model';
import { CustomError } from '../../core/errors/custom-error';

@injectable()
export class PdfRepository {
  async create(data: {
    userId: string;
    fileName: string;
    s3Key: string;
    uploadDate: Date;
    parentPdfId?: string;
  }): Promise<IPdf> {
    try {
      const pdf = new PdfModel(data);
      return await pdf.save();
    } catch (error) {
      throw new CustomError('Failed to create PDF record', 500);
    }
  }

  async findById(id: string): Promise<IPdf | null> {
    return PdfModel.findById(id).exec();
  }

  async findByUserId(userId: string): Promise<IPdf[]> {
    return PdfModel.find({ userId }).exec();
  }
}