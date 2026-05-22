import { SubscriptionStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateSubscriptionDto {
  @IsEnum(SubscriptionStatus)
  status!: SubscriptionStatus;

  @IsOptional()
  @IsString()
  planCode?: string;

  @IsOptional()
  @IsDateString()
  currentPeriodEndsAt?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  annualPriceCentsMx?: number;
}
