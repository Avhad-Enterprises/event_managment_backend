import { Router } from 'express';
import Route from '../interfaces/route.interface';
import DynamicFormController from '../controllers/dynamicform.controller';
import validationMiddleware from '../middlewares/validation.middleware';
import { DynamicFormDto } from '../dtos/dynamicform.dto';

class DynamicFormRoute implements Route {
    public path = '/dynamicforms';
    public router = Router();
    public dynamicFormController = new DynamicFormController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}/insertform`, validationMiddleware(DynamicFormDto, 'body', false, []), this.dynamicFormController.insertForm);
        this.router.get(`${this.path}/all`, this.dynamicFormController.getAllActiveForms);
        this.router.post(`${this.path}/getformbyid`, this.dynamicFormController.getFormById);
        this.router.put(`${this.path}/updateform`, validationMiddleware(DynamicFormDto, 'body', false, []), this.dynamicFormController.updateForm);
        this.router.put(`${this.path}/deleteform`, this.dynamicFormController.DeleteForm);
    }
}

export default DynamicFormRoute;
