import { injectable } from 'inversify';
import multer from 'multer';
import { CustomError } from '../../core/errors/custom-error';

@injectable()
export class FileUploadMiddleware {
  private storage = multer.memoryStorage();
  private fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new CustomError('Only PDF files are allowed', 400));
    }
    cb(null, true);
  };

  public upload = multer({
    storage: this.storage,
    fileFilter: this.fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  });
}