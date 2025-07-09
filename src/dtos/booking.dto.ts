import { IsString, IsOptional, IsNumber, IsBoolean, IsInt, IsDate } from "class-validator";

export class BookingDto {
    @IsOptional()
    @IsString()
    ticket_type?: string;

    @IsOptional()
    @IsString()
    user_id?: string;

    @IsOptional()
    @IsString()
    ticket_id?: string;

    @IsNumber()
    quantity: number;

    @IsString()
    name: string;

    @IsString()
    email_address: string;

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
}
