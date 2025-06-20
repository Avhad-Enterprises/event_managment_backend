import {
  IsBoolean,
  IsDecimal,
  IsInt,
  IsOptional,
  IsString,
} from "class-validator";

export class UsersDto {
  @IsOptional({ groups: ["insert"] })
  @IsInt({ groups: ["update"] })
  user_id: number;

  @IsOptional({ groups: ["update"] })
  @IsString({ groups: ["update", "create"] })
  firstname: string;

  @IsOptional({ groups: ["update"] })
  @IsString({ groups: ["update", "create"] })
  lastname: string;

  @IsOptional({ groups: ["update", "create"] })
  @IsString({ groups: ["update", "create"] })
  email: string;

  @IsOptional({ groups: ["update", "create"] })
  @IsString({ groups: ["update", "create"] })
  profile_picture: string;

  @IsOptional({ groups: ["insert", "update"] })
  @IsBoolean({ groups: ["insert", "update"] })
  is_deleted: boolean;

  @IsOptional({ groups: ["update"] })
  @IsString({ groups: ["create", "login"] })
  password: string;
}
