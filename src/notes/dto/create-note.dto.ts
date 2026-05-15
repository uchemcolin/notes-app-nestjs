import { IsString, MinLength, MaxLength, IsNotEmpty, Matches } from 'class-validator';

export class CreateNoteDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  title!: string;

  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content cannot be empty' })
  @MinLength(1, { message: 'Content must have at least 1 character' })
  content!: string; // No longer optional, must be non-empty string
}