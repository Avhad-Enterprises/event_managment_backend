import { EmployeeDto } from "../dtos/employee.dto";
import DB, { T } from "../database/index.schema";
import { IEmployee } from "../interfaces/employee.interface";
import HttpException from "../exceptions/HttpException";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { uploadToAws } from '../utils/util';

class EmployeeService {

    public async uploadFileToS3(filename: string, base64String: string): Promise<string> {
        try {
            const fileUrl = await uploadToAws(filename, base64String);
            return fileUrl.fileUrl;
        } catch (error) {
            console.error('Error in service:', error.message);
            throw new HttpException(500, 'Error uploading file to S3');
        }
    }
}

export default EmployeeService;
