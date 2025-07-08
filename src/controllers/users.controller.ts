import { NextFunction, Request, Response } from "express";
import { UsersDto } from "../dtos/users.dto";
import { IUser } from "../interfaces/users.interface";
import UsersService from "../services/users.service";
import { generateToken } from "../utils/jwt";
import HttpException from "../exceptions/HttpException";
import crypto from 'crypto';
import sendPasswordResetEmail from '../utils/sendResetPasswordEmail';
import DB, { T } from "../database/index.schema";
import sendEmail from '../utils/sendemail';

class UsersController {
  public UsersService = new UsersService();

  public getAllActiveCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.UsersService.getAllActiveCustomers();
      res.status(200).json({ data: users, message: "Active customers fetched successfully" });
    } catch (error) {
      next(error);
    }
  };

  public getAllActiveAdminMem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.UsersService.getAllActiveAdmins();
      res.status(200).json({ data: users, message: "Active Members fetched successfully" });
    } catch (error) {
      next(error);
    }
  };

  public insertUser = async (
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

  public loginUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new HttpException(400, "Please provide both email and password");
      }

      const user = await this.UsersService.customerLogin(email, password);

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

  public inviteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = req.body;
      if (!body.email) throw new HttpException(400, "Email is required");
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await this.UsersService.createUserInvitation({
        ...body,
        invite_token: token,
        expires_at: expiresAt,
      });
      const inviteLink = `${process.env.FRONTEND_URL}/register?token=${token}`;
      await sendEmail({
        to: body.email,
        subject: `You're Invited to Register - ${process.env.FRONTEND_APPNAME}`,
        html: `
        <p>Hi${body.full_name ? ` ${body.full_name}` : ''},</p>
        <p>You’ve been invited to join <strong>${process.env.FRONTEND_APPNAME}</strong>.</p>
        <p>Please click the link below to register your account:</p>
        <p><a href="${inviteLink}" target="_blank" style="color: #1a73e8; text-decoration: underline;">Click here to register</a></p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not expect this invitation, you can safely ignore this email.</p>
        <p>Thanks,<br>${process.env.FRONTEND_APPNAME} Team</p>
      `,
      });
      res.status(200).json({ message: "Invitation sent" });
    } catch (error) {
      next(error);
    }
  };


  public insertEmployee = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData: UsersDto & { invite_token: string } = req.body;
      await this.UsersService.validateInvitation(userData.email, userData.invite_token);
      const user = await this.UsersService.Insert(userData);
      await DB(T.USERINVITATIONS)
        .where({ email: userData.email })
        .update({ used: true });
      res.status(201).json({ data: user, message: "User registered successfully" });
    } catch (error) {
      next(error);
    }
  };

  public getAllInvitations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const invitations = await this.UsersService.getAllInvitations();
      res.status(200).json({ data: invitations, message: "Invitations fetched successfully" });
    } catch (error) {
      next(error);
    }
  };

}

export default UsersController;
