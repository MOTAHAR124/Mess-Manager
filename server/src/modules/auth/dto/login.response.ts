import { IsString, IsEmail } from "class-validator";

export class LoginResponse {
  @IsString()
  accessToken: string;

  @IsString()
  userId: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;
}

export class AuthCallbackDto {
  @IsString()
  code: string;

  @IsString()
  state?: string;
}
