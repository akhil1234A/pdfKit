import request from 'supertest';
import express from 'express';
import { Container } from 'inversify';
import { configureDI } from '../../di/container';
import { PdfRoutes } from '../routes/pdf.routes';
import { UserModel } from '../../domain/models/user.model';
import { PdfModel } from '../../domain/models/pdf.model';
import { S3Service } from '../../infrastructure/s3/s3.service';
import { TYPES } from '../../di/types';
import { AuthService } from '../services/auth.service';
import { PDFDocument } from 'pdf-lib';

jest.mock('../../infrastructure/s3/s3.service');

describe('PdfController', () => {
  let app: express.Application;
  let container: Container;
  let s3Service: S3Service;
  let token: string;

  beforeEach(async () => {
    container = configureDI();
    app = express();
    app.use(express.json());
    const pdfRoutes = container.get<PdfRoutes>(PdfRoutes);
    app.use('/api/pdf', pdfRoutes.router);
    s3Service = container.get<S3Service>(TYPES.S3Service);

    await UserModel.deleteMany({});
    await PdfModel.deleteMany({});

    const user = await UserModel.create({ email: 'test@example.com', password: 'hashed' });
    const authService = container.get<AuthService>(TYPES.AuthService);
    token = authService['generateAccessToken'](user.id);
  });

  it('POST /api/pdf/upload should upload a PDF', async () => {
    jest.spyOn(s3Service, 'uploadFile').mockResolvedValue(undefined);
    jest.spyOn(s3Service, 'getSignedUrl').mockResolvedValue('signed-url');

    const response = await request(app)
      .post('/api/pdf/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('file', Buffer.from('pdf'), 'test.pdf')
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('fileName', 'test.pdf');
  });

  it('POST /api/pdf/:id/extract should extract pages', async () => {
    const pdf = await PdfModel.create({
      userId: 'user1',
      fileName: 'test.pdf',
      s3Key: 'key',
      uploadDate: new Date(),
    });

    jest.spyOn(s3Service, 'downloadFile').mockResolvedValue(Buffer.from('pdf'));
    jest.spyOn(s3Service, 'uploadFile').mockResolvedValue(undefined);
    jest.spyOn(s3Service, 'getSignedUrl').mockResolvedValue('signed-url');

    const mockPdfDoc = {
      getPageCount: jest.fn().mockReturnValue(1),
      copyPages: jest.fn().mockResolvedValue([{}]),
    } as unknown as PDFDocument;

    const mockNewPdfDoc = {
      addPage: jest.fn(),
      save: jest.fn().mockResolvedValue(Buffer.from('new')),
    } as unknown as PDFDocument;

    jest.spyOn(PDFDocument, 'load').mockResolvedValue(mockPdfDoc);
    jest.spyOn(PDFDocument, 'create').mockResolvedValue(mockNewPdfDoc);

    const response = await request(app)
      .post(`/api/pdf/${pdf.id}/extract`)
      .set('Authorization', `Bearer ${token}`)
      .send({ pages: [1] })
      .expect(200);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('signedUrl', 'signed-url');
  });
});