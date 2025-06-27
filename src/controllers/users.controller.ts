import { NextFunction, Request, Response } from "express";
import { UsersDto } from "../dtos/users.dto";
import { IUser } from "../interfaces/users.interface";
import UsersService from "../services/users.service";
import { generateToken } from "../utils/jwt";
import HttpException from "../exceptions/HttpException";
import crypto from 'crypto';
import sendPasswordResetEmail from '../utils/sendResetPasswordEmail';

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

  public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user_id } = req.body;
      if (!user_id) throw new HttpException(400, "User ID is required");

      const user = await this.UsersService.getById(user_id);
      res.status(200).json({ data: user, message: "User fetched successfully" });
    } catch (error) {
      next(error);
    }
  };

  public updateUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: UsersDto = req.body;
      const user = await this.UsersService.updateById(userData);
      res.status(200).json({ data: user, message: "User updated successfully" });
    } catch (error) {
      next(error);
    }
  };

  public softDeleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user_id } = req.body;
      if (!user_id) throw new HttpException(400, "User ID is required");

      const deleted = await this.UsersService.softDelete(user_id);
      res.status(200).json({ data: deleted, message: "User soft-deleted successfully" });
    } catch (error) {
      next(error);
    }
  };

  public forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      if (!email) throw new HttpException(400, "Email is required");

      const user = await this.UsersService.getUserByEmail(email);
      if (!user) throw new HttpException(404, "User not found");

      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      await this.UsersService.saveResetToken(user.user_id, token, expires);

      const protocol = req.protocol;
      const host = req.get('host');

      const resetLink = `${protocol}://${host}/reset-password?token=${token}`;

      await sendPasswordResetEmail(email, 'Reset Your Password', `Click this link to reset your password: ${resetLink}`);

      res.status(200).json({ message: "Password reset link sent" });
    } catch (error) {
      next(error);
    }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword, confirmPassword } = req.body;

      if (!token || !newPassword || !confirmPassword)
        throw new HttpException(400, "All fields are required");

      if (newPassword !== confirmPassword)
        throw new HttpException(400, "Passwords do not match");

      await this.UsersService.resetPassword(token, newPassword);

      res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      next(error);
    }
  };

  public getFreelancerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id } = req.body;
      if (!user_id) throw new HttpException(400, "User ID is required");

      const user = await this.UsersService.getFreelancerById(user_id);
      res.status(200).json({ data: user, message: "Freelancer fetched successfully" });
    } catch (error) {
      next(error);
    }
  };

  public getClientById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id } = req.body;
      if (!user_id) throw new HttpException(400, "User ID is required");

      const user = await this.UsersService.getClientById(user_id);
      res.status(200).json({ data: user, message: "Client fetched successfully" });
    } catch (error) {
      next(error);
    }
  };

  public getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id } = req.body;
      if (!user_id) throw new HttpException(400, "User ID is required");

      const user = await this.UsersService.getCustomerById(user_id);
      res.status(200).json({ data: user, message: "Customer fetched successfully" });
    } catch (error) {
      next(error);
    }
  };

  public getAdminById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_id } = req.body;
      if (!user_id) throw new HttpException(400, "User ID is required");

      const user = await this.UsersService.getAdminById(user_id);
      res.status(200).json({ data: user, message: "Admin fetched successfully" });
    } catch (error) {
      next(error);
    }
  };


}

export default UsersController;
