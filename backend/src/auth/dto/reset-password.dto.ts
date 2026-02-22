import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsStrongPassword(
    {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    },
    {
      message:
        'Password is too weak. It must be at least 6 characters long and include one uppercase letter, one lowercase letter, and one number.',
    },
  )
  @IsNotEmpty()
  newPassword: string;
}