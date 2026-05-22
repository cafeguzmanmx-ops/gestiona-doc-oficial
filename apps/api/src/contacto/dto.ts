import { DemoRequestStatus } from '@prisma/client';
import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDemoRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  municipioName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  state!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  contactName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  position?: string;

  @IsEmail()
  @MaxLength(180)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  estimatedUsers?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  message?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  source?: string;
}

export class UpdateDemoRequestDto {
  @IsOptional()
  @IsEnum(DemoRequestStatus)
  status?: DemoRequestStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1500)
  notes?: string;
}
