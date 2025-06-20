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
    this.router.post(`${this.path}/insertemployee`, validationMiddleware(UsersDto, 'body', false, []), this.usersController.insertEmployee);
    this.router.post(`${this.path}/login`, this.usersController.loginEmployee);
  }
}

export default UsersRoute;
