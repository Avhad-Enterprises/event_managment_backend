import { IsNotEmpty, IsString, IsJSON, IsNumber, IsOptional, IsDate, IsInt } from 'class-validator';

export class DynamicFormDto {
    @IsOptional()
    @IsInt()
    id?: string;

    @IsNotEmpty()
    @IsString()
    public form_title: string;

    @IsNotEmpty()
    @IsString()
    public form_description: string;

    @IsNotEmpty()
    @IsJSON()
    public form_data: any;

    @IsOptional()
    @IsNotEmpty()
    @IsNumber()
    public created_by: number;
}
