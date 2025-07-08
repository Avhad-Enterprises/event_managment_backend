import { Router } from "express";
import Route from "../interfaces/route.interface";
import validationMiddleware from "../middlewares/validation.middleware";
import EventController from "../controllers/event.controller";
import { EventDto } from "../dtos/event.dto";

class EventRoute implements Route {
    public path = "/event";
    public router = Router();
    public eventController = new EventController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/activeevents`, (req, res, next) => this.eventController.getAllActiveEvents(req, res, next));
        this.router.post(`${this.path}/insertevent`, validationMiddleware(EventDto, 'body', false, []), (req, res, next) => this.eventController.insertevent(req, res, next));
        this.router.get(`${this.path}/editevent/:id`, (req, res, next) => this.eventController.getEventById(req, res, next));
        this.router.put(`${this.path}/updateevent/:id`, validationMiddleware(EventDto, 'body', false, []), (req, res, next) => this.eventController.updateEvent(req, res, next));
        this.router.post(`${this.path}/deleteevent`, validationMiddleware(EventDto, 'body', true, []), (req, res, next) => this.eventController.deleteEvent(req, res, next));
        this.router.get(`${this.path}/get-by-url/:meta_url`, (req, res, next) => this.eventController.getEventByMetaUrl(req, res, next));
    }
}

export default EventRoute;
