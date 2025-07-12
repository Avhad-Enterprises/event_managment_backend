import {
    IsString,
    IsOptional,
    IsNumber,
    IsBoolean,
    IsInt,
    IsDate,
    IsArray,
    ValidateNested,
    IsEmail
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
    @IsInt()
    event_id: number;

    @IsOptional()
    @IsString()
    ticket_type?: string;

    @IsOptional()
    @IsInt()
    user_id?: number;

    @IsOptional()
    @IsString()
    ticket_id?: string;

    @IsInt()
    quantity: number;

    @IsOptional()
    @IsNumber()
    ticket_price?: number;

    @IsOptional()
    @IsNumber()
    total_amount?: number;

    @IsOptional()
    @IsString()
    booking_status?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    email_address?: string;

    @IsOptional()
    @IsString()
    phone_number?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsString()
    payment_method?: string;

    @IsOptional()
    @IsString()
    promo_code?: string;

    @IsOptional()
    @IsBoolean()
    terms_and_conditions?: boolean;

    @IsOptional()
    @IsBoolean()
    notify_via_email_sms?: boolean;

    @IsOptional()
    @IsString()
    tags?: string;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsInt()
    is_active?: number;

    @IsOptional()
    @IsInt()
    created_by?: number;

    @IsOptional()
    @IsDate()
    created_at?: Date;

    @IsOptional()
    @IsDate()
    updated_at?: Date;

    @IsOptional()
    @IsInt()
    updated_by?: number;

    @IsOptional()
    @IsBoolean()
    is_deleted?: boolean;

    @IsOptional()
    @IsInt()
    deleted_by?: number;

    @IsOptional()
    @IsDate()
    deleted_at?: Date;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TicketHolderDto)
    ticket_holders: TicketHolderDto[];
}
