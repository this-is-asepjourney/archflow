import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateApiEndpointDto {
  @IsString()
  method: string;

  @IsString()
  path: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  requestSchema?: any;

  @IsOptional()
  @IsObject()
  responseSchema?: any;
}

export class UpdateApiEndpointDto {
  @IsOptional()
  @IsString()
  method?: string;

  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  requestSchema?: any;

  @IsOptional()
  @IsObject()
  responseSchema?: any;
}
