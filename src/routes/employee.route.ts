import { Router } from "express";
import Route from "../interfaces/route.interface";

import validationMiddleware from "../middlewares/validation.middleware";
import EmployeeController from "../controllers/employee.controller";
import { EmployeeDto } from "../dtos/employee.dto";

class EmployeeRoute implements Route {
  public path = "/users";
  public router = Router();
  public employeeController = new EmployeeController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    //Employee section  , validationMiddleware(EmployeeDto, 'body', false, [])
    //this.router.post(`${this.path}/insertemployee`,this.employeeController.insertEmployee);
    this.router.post(`${this.path}/insertemployee`, validationMiddleware(EmployeeDto, 'body', false, []), this.employeeController.insertEmployee);
    this.router.post(`${this.path}/login`, this.employeeController.loginEmployee);
  }
}

export default EmployeeRoute;
