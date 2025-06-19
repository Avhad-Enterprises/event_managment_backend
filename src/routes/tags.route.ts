import { Router } from "express";
import Route from "../interfaces/route.interface";

import validationMiddleware from "../middlewares/validation.middleware";
import TagsController from "../controllers/tags.controller";
import { TagsDto } from "../dtos/tags.dto";

class TagsRoute implements Route {
    public path = "/tags";
    public router = Router();
    public tagsController = new TagsController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Employee section  , validationMiddleware(EmployeeDto, 'body', false, [])
        // this.router.post(`${this.path}/insertemployee`,this.employeeController.insertEmployee);
        this.router.post(`${this.path}/insertetag`, validationMiddleware(TagsDto, 'body', false, []), this.tagsController.insertTag);
        this.router.get(`${this.path}/geteventtags`, (req, res, next) => this.tagsController.getTagsByType(req, res, next));
    }
}

export default TagsRoute;
