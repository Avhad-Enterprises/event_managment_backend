import { NextFunction, Request, Response } from "express";
import { EmployeeDto } from "../dtos/employee.dto";
import { IEmployee } from "../interfaces/employee.interface";
import EmployeeService from "../services/employee.service";
import { generateToken } from "../utils/jwt";
import HttpException from "../exceptions/HttpException";

class EmployeeController {
  public EmployeeService = new EmployeeService();

  public insertEmployee = async (
    req: Request,
    res: Response,
    next: NextFunction
    ): Promise<void> => {
    try {
      const userData: EmployeeDto = req.body;
      const locationData: IEmployee = await this.EmployeeService.Insert(
        userData
      );
      res.status(201).json({ data: locationData, message: "Inserted" });
    } catch (error) {
      next(error);
    }
  };

  public loginEmployee = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new HttpException(400, "Please provide both email and password");
      }

      const user = await this.EmployeeService.Login(email, password);

      // Exclude password from response
      const { password: _pw, ...userData } = user as any;

      const token = generateToken(userData);

      res.status(200).json({
        data: { user: userData, token },
        message: "Login successful",
      });
    } catch (error) {
      next(error);
    }
  };


}

export default EmployeeController;
