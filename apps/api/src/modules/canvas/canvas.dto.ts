import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsIn,
} from 'class-validator';
import type { CanvasType } from './canvas.entity';

export class CreateCanvasDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsIn([
    'TOPOLOGY',
    'FLOW',
    'UML',
    'ERD',
    'INFRASTRUCTURE',
    'CICD',
    'SEQUENCE',
  ])
  type: CanvasType;
}

export class UpdateCanvasDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsObject()
  @IsOptional()
  nodes?: any[];

  @IsObject()
  @IsOptional()
  edges?: any[];

  @IsObject()
  @IsOptional()
  viewport?: { x: number; y: number; zoom: number };
}
