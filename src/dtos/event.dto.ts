import {
    IsString,
    IsOptional,
    IsNumber,
    IsDateString,
    IsInt,
    IsJSON,
    IsDate,
} from "class-validator";

export class EventDto {
    @IsString()
    event_title: string;

    @IsString()
    event_description: string;

    @IsOptional()
    @IsString()
    banner_image: string;

    @IsOptional()
    @IsString()
    more_images: File[];

    @IsOptional()
    @IsString()
    promo_video: File;

    @IsString()
    venue_name: string;

    @IsOptional()
    @IsString()
    gate_no?: string;

    @IsOptional()
    @IsString()
    map_integration?: string;

    @IsDateString()
    date: string;

    @IsOptional()
    @IsString()
    time: string;

    @IsOptional()
    @IsString()
    agenda?: string;

    @IsOptional()
    @IsString()
    time_zone_selector?: string;

    @IsInt()
    total_seats: number;

    @IsNumber()
    ticket_price: number;

    @IsJSON()
    speaker_details: any;

    @IsOptional()
    @IsString()
    sponsors?: string;

    @IsOptional()
    @IsString()
    our_partners?: string;

    @IsOptional()
    @IsInt()
    updated_by?: number;

    @IsOptional()
    @IsDate()
    updated_at?: Date;
    
}