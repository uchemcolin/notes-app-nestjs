import { IsString, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
    @IsString()
    token!: string;

    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters' })
    @MaxLength(50, { message: 'Password must not exceed 50 characters' })
    newPassword!: string;
}