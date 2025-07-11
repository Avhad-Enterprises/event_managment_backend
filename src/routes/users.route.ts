import { Router } from "express";
import Route from "../interfaces/route.interface";
import validationMiddleware from "../middlewares/validation.middleware";
import UsersController from "../controllers/users.controller";
import { UsersDto } from "../dtos/users.dto";

class UsersRoute implements Route {
  public path = "/users";
  public router = Router();
  public usersController = new UsersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/customers/active`, this.usersController.getAllActiveCustomers);
    this.router.get(`${this.path}/admin-users/active`, this.usersController.getAllActiveAdminMem);
    this.router.post(`${this.path}/insert_user`, validationMiddleware(UsersDto, 'body', false, []), this.usersController.insertUser);
    this.router.post(`${this.path}/login`, this.usersController.loginEmployee);
    this.router.post(`${this.path}/userlogin`, this.usersController.loginUser);
    this.router.post(`${this.path}/get_user_by_id`, this.usersController.getUserById);
    this.router.post(`${this.path}/update_user_by_id`, validationMiddleware(UsersDto, 'body', false, []), this.usersController.updateUserById);
    this.router.post(`${this.path}/soft_delete_user`, this.usersController.softDeleteUser);
    this.router.post(`${this.path}/forgot-password`, this.usersController.forgotPassword);
    this.router.post(`${this.path}/reset-password`, this.usersController.resetPassword);

    // Invite user (Admin only)
    this.router.get(`${this.path}/invitations`, this.usersController.getAllInvitations);
    this.router.post(`${this.path}/invite`, this.usersController.inviteUser);

    // Register invited user
    this.router.post(`${this.path}/register`, validationMiddleware(UsersDto, 'body', false, []), this.usersController.insertEmployee);
  }
}

export default UsersRoute;
