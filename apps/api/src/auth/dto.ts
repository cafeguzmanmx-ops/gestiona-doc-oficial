import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterMunicipioDto {
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
  adminName!: string;

  @IsEmail()
  @MaxLength(180)
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(120)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, { message: 'La contraseña debe incluir mayúscula, minúscula y número' })
  password!: string;
}

export class LoginDto {
  @IsEmail()
  @MaxLength(180)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  password!: string;
}

export class BootstrapSuperAdminDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  bootstrapToken!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  fullName!: string;

  @IsEmail()
  @MaxLength(180)
  email!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(120)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, { message: 'La contraseña debe incluir mayúscula, minúscula y número' })
  password!: string;
}
