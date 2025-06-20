import { NextFunction, Request, Response } from "express";
import { UsersDto } from "../dtos/users.dto";
import { IUser } from "../interfaces/users.interface";
import UsersService from "../services/users.service";
import { generateToken } from "../utils/jwt";
import HttpException from "../exceptions/HttpException";

class UsersController {
  public UsersService = new UsersService();

  public insertEmployee = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userData: UsersDto = req.body;
      const locationData: IUser = await this.UsersService.Insert(
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

      const user = await this.UsersService.Login(email, password);

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

export default UsersController;
