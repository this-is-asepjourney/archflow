import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { RequirementType, RequirementStatus, RequirementPriority } from './requirement.entity';

export class CreateRequirementDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['BUSINESS', 'FUNCTIONAL', 'NON_FUNCTIONAL'])
  type: RequirementType;

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  priority?: RequirementPriority;
}

export class UpdateRequirementDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['BUSINESS', 'FUNCTIONAL', 'NON_FUNCTIONAL'])
  type?: RequirementType;

  @IsOptional()
  @IsEnum(['DRAFT', 'IN_PROGRESS', 'REVIEW', 'APPROVED', 'DONE'])
  status?: RequirementStatus;

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  priority?: RequirementPriority;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  linkedNodeIds?: string[];
}
