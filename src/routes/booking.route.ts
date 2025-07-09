import { Router } from "express";
import Route from "../interfaces/route.interface";
import validationMiddleware from "../middlewares/validation.middleware";
import BookingController from "../controllers/booking.controller";
import { BookingDto } from "../dtos/booking.dto";

class BookingRoute implements Route {
    public path = "/booking";
    public router = Router();
    public bookingController = new BookingController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}/activebookings`, (req, res, next) => this.bookingController.getAllActiveBookings(req, res, next));
        this.router.get(`${this.path}/purchasedtickets`, (req, res, next) => this.bookingController.getAllTickets(req, res, next));
        this.router.post(`${this.path}/insertbooking`, validationMiddleware(BookingDto, 'body', false, []), (req, res, next) => this.bookingController.insertBooking(req, res, next));
        this.router.get(`${this.path}/editbooking/:id`, (req, res, next) => this.bookingController.getBookingById(req, res, next));
        this.router.put(`${this.path}/updatebooking/:id`, validationMiddleware(BookingDto, 'body', false, []), (req, res, next) => this.bookingController.updateBooking(req, res, next));
        this.router.post(`${this.path}/deletebooking`, validationMiddleware(BookingDto, 'body', true, []), (req, res, next) => this.bookingController.deleteBooking(req, res, next));
        this.router.post(`${this.path}/scan`, validationMiddleware(BookingDto, 'body', true, []), (req, res, next) => this.bookingController.scanBookingTicket(req, res, next));
        this.router.get(`${this.path}/users/bookings/:userId`, (req, res, next) => this.bookingController.getUserBookingHistory(req, res, next));
    }
}

export default BookingRoute;
