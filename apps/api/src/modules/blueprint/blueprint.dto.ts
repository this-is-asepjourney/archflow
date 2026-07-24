import { IsOptional, IsString } from 'class-validator';

export class UpdateBlueprintDto {
  @IsOptional()
  @IsString()
  businessRequirements?: string;

  @IsOptional()
  @IsString()
  functionalRequirements?: string;

  @IsOptional()
  @IsString()
  nonFunctionalRequirements?: string;

  @IsOptional()
  @IsString()
  architectureDecisions?: string;

  @IsOptional()
  @IsString()
  technicalNotes?: string;

  @IsOptional()
  @IsString()
  risks?: string;

  @IsOptional()
  @IsString()
  milestones?: string;

  @IsOptional()
  @IsString()
  deploymentPlan?: string;

  @IsOptional()
  @IsString()
  securityPlan?: string;

  @IsOptional()
  @IsString()
  testingPlan?: string;

  @IsOptional()
  @IsString()
  maintenancePlan?: string;
}
