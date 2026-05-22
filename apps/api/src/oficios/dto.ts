import { OficioPriority, OficioStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOficioDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  externalNumber?: string;

  @IsDateString()
  receivedAt!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  senderName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  senderAgency?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(220)
  subject!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2500)
  description?: string;

  @IsEnum(OficioPriority)
  priority!: OficioPriority;

  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  responsibleAreaId?: string;
}

export class UpdateOficioStatusDto {
  @IsEnum(OficioStatus)
  status!: OficioStatus;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1500)
  comment!: string;
}

export class CreateSeguimientoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1500)
  comment!: string;

  @IsOptional()
  @IsEnum(OficioStatus)
  statusTo?: OficioStatus;
}

export class CloseOficioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(1500)
  comment!: string;
}
