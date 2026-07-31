import { IsString, IsOptional, IsArray, IsIn } from 'class-validator';

export class UpdateComponentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  typeKey?: string;

  @IsOptional()
  @IsString()
  iconUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsOptional()
  @IsArray()
  propertiesSchema?: any[];

  @IsOptional()
  @IsIn(['private', 'workspace', 'public'])
  visibility?: string;
}
