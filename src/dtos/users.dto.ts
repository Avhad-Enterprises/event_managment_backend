import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsJSON,
} from "class-validator";

export class UsersDto {
  @IsOptional({ groups: ["update"] })
  @IsInt({ groups: ["update"] })
  user_id: number;

  @IsOptional()
  @IsString()
  first_name: string;

  @IsOptional()
  @IsString()
  last_name: string;

  @IsOptional()
  @IsString()
  username: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone_number: string;

  @IsOptional()
  @IsString()
  profile_picture: string;

  @IsOptional()
  @IsString()
  address_line_first: string;

  @IsOptional()
  @IsString()
  address_line_second: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  state: string;

  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  @IsString()
  pincode: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsOptional()
  @IsBoolean()
  aadhaar_verification: boolean;

  @IsOptional()
  @IsBoolean()
  email_verified: boolean;

  @IsOptional()
  @IsBoolean()
  phone_verified: boolean;

  @IsOptional()
  @IsString()
  reset_token: string;

  @IsOptional()
  @IsString()
  reset_token_expires: string;

  @IsOptional()
  @IsInt()
  login_attempts: number;

  @IsOptional()
  @IsBoolean()
  kyc_verified: boolean;

  @IsOptional()
  @IsString()
  role: string;

  @IsOptional()
  @IsString()
  banned_reason: string;

  @IsOptional()
  @IsString()
  bio: string;

  @IsOptional()
  @IsString()
  timezone: string;

  @IsOptional()
  skill: any; // JSONB

  @IsOptional()
  @IsBoolean()
  email_notifications: boolean;

  @IsOptional()
  tags: any; // JSONB

  @IsOptional()
  @IsBoolean()
  notes: boolean;

  @IsOptional()
  certification: any; // JSONB

  @IsOptional()
  education: any; // JSONB

  @IsOptional()
  @IsString()
  experience: string;

  @IsOptional()
  services: any; // JSONB

  @IsOptional()
  previous_works: any; // JSONB

  @IsOptional()
  @IsInt()
  projects_created: number;

  @IsOptional()
  @IsInt()
  projects_applied: number;

  @IsOptional()
  @IsInt()
  projects_completed: number;

  @IsOptional()
  @IsInt()
  hire_count: number;

  @IsOptional()
  @IsInt()
  review_id: number;

  @IsOptional()
  @IsInt()
  total_earnings: number;

  @IsOptional()
  @IsInt()
  total_spent: number;

  @IsOptional()
  payment_method: any;

  @IsOptional()
  payout_method: any;

  @IsOptional()
  bank_account_info: any;

  @IsOptional()
  @IsString()
  account_type: string;

  @IsOptional()
  @IsString()
  availability: string;

  @IsOptional()
  @IsInt()
  time_spent: number;

  @IsOptional()
  @IsString()
  account_status: string;

  @IsOptional()
  @IsBoolean()
  is_active: boolean;

  @IsOptional()
  @IsBoolean()
  is_banned: boolean;

  @IsOptional()
  @IsString()
  created_at: string;

  @IsOptional()
  @IsString()
  updated_at: string;

  @IsOptional()
  @IsString()
  updated_by: string;

  @IsOptional()
  @IsString()
  last_login_at: string;
}
