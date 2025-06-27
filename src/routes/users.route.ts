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
    this.router.post(`${this.path}/insert_user`, validationMiddleware(UsersDto, 'body', false, []), this.usersController.insertEmployee);
    this.router.post(`${this.path}/login`, this.usersController.loginEmployee);
    this.router.post(`${this.path}/get_user_by_id`, this.usersController.getUserById);
    this.router.post(`${this.path}/update_user_by_id`, validationMiddleware(UsersDto, 'body', false, []), this.usersController.updateUserById);
    this.router.post(`${this.path}/soft_delete_user`, this.usersController.softDeleteUser);
    this.router.post(`${this.path}/forgot-password`, this.usersController.forgotPassword);
    this.router.post(`${this.path}/reset-password`, this.usersController.resetPassword);

    // Get All types of user By id
    this.router.post(`${this.path}/get_freelancer_by_id`, this.usersController.getFreelancerById);
    this.router.post(`${this.path}/get_client_by_id`, this.usersController.getClientById);
    this.router.post(`${this.path}/get_customer_by_id`, this.usersController.getCustomerById);
    this.router.post(`${this.path}/get_admin_by_id`, this.usersController.getAdminById);
  }
}

export default UsersRoute;
