/*import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';

export class SignupDto {
  @IsString()
  firstName!: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsString()
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}*/

import { IsEmail, IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';

export class SignupDto {
  @IsString({ message: 'First name must be a string' })
  @MinLength(2, { message: 'First name must be at least 2 characters' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName!: string;

  @IsOptional()
  @IsString({ message: 'Middle name must be a string' })
  @MaxLength(50, { message: 'Middle name must not exceed 50 characters' })
  middleName?: string;

  @IsString({ message: 'Last name must be a string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName!: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(100, { message: 'Email must not exceed 100 characters' })
  email!: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  @MaxLength(50, { message: 'Password must not exceed 50 characters' })
  /*@Matches(/^(?=.*[A-Za-z])(?=.*\d)/, { 
    message: 'Password must contain at least one letter and one number' 
  })*/
  password!: string;
}