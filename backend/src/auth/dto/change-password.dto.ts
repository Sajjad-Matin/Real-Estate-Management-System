import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

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
        'New password is too weak. It must be at least 6 characters long and include one uppercase letter, one lowercase letter, and one number.',
    },
  )
  @IsNotEmpty()
  newPassword: string;
}