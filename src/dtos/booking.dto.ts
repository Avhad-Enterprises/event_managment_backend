import {
    IsString,
    IsOptional,
    IsNumber,
    IsBoolean,
    IsInt,
    IsDate,
    IsArray,
    ValidateNested,
    IsEmail,
} from "class-validator";
import { Type } from "class-transformer";

class TicketHolderDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    phone_number: string;

    @IsOptional()
    @IsString()
    location?: string;
}

export class BookingDto {
    @IsOptional()
    @IsString()
    ticket_type?: string;

    @IsOptional()
    @IsNumber()
    user_id?: number;

    @IsOptional()
    @IsString()
    ticket_id?: string;

    @IsNumber()
    quantity: number;

    @IsOptional()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    email_address: string;

    @IsOptional()
    @IsString()
    phone_number: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    payment_method?: string;

    @IsOptional()
    @IsString()
    promo_code?: string;

    @IsBoolean()
    terms_and_conditions?: boolean;

    @IsOptional()
    @IsBoolean()
    notify_via_email_sms?: boolean;

    @IsOptional()
    @IsInt()
    created_by?: number;

    @IsOptional()
    @IsDate()
    updated_at?: Date;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TicketHolderDto)
    ticket_holders: TicketHolderDto[];
}
