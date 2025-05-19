import mongoose, { Schema, Document } from 'mongoose';

export interface IPdf extends Document {
  userId: string;
  fileName: string;
  s3Key: string;
  uploadDate: Date;
  parentPdfId?: string;
}

const PdfSchema: Schema = new Schema({
  userId: { type: String, required: true },
  fileName: { type: String, required: true },
  s3Key: { type: String, required: true },
  uploadDate: { type: Date, required: true },
  parentPdfId: { type: String },
});

export const PdfModel = mongoose.model<IPdf>('Pdf', PdfSchema);