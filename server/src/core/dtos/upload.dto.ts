import { IsNotEmpty } from 'class-validator';

export class UploadDto {
  @IsNotEmpty()
  file!: Express.Multer.File;
}