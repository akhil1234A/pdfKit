import { IsArray, IsInt, Min } from 'class-validator';

export class ExtractDto {
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  pages!: number[];
}