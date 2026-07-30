import { IsString, IsOptional, IsArray, IsObject, IsIn } from 'class-validator';

export class CreateComponentDto {
  @IsString()
  name: string;

  @IsString()
  category: string;

  @IsString()
  typeKey: string;

  @IsString()
  iconUrl: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  vendor?: string;

  @IsArray()
  propertiesSchema: any[];

  @IsOptional()
  @IsIn(['private', 'workspace', 'public'])
  visibility?: string;

  @IsOptional()
  @IsString()
  workspaceId?: string;
}
