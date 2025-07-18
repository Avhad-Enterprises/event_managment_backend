import { NextFunction, Request, Response } from "express";
import BookingService from "../services/booking.service";
import { BookingDto } from "../dtos/booking.dto";

class BookingController {
    public bookingService = new BookingService();

    public getAllActiveBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const bookings = await this.bookingService.GetAllActiveBookings();
            res.status(200).json({ data: bookings, message: "Active bookings fetched" });
        } catch (error) {
            next(error);
        }
    };

    public insertBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const bookingData = req.body;
            const insertedBooking = await this.bookingService.InsertBooking(bookingData, req.user);

            res.status(201).json({
                data: insertedBooking,
                message: "Booking inserted successfully"
            });
        } catch (error) {
            next(error);
        }
    };


    public getAllTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const bookings = await this.bookingService.GetAllAllTickets();
            res.status(200).json({ data: bookings, message: "Tickets fetched" });
        } catch (error) {
            next(error);
        }
    };

    public scanBookingTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const result = await this.bookingService.ScanAndMarkBooking(req.body);
            res.status(200).json({ message: "Check-in success", data: result });
        } catch (error) {
            next(error);
        }
    };

    public getBookingById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const bookingId = Number(req.params.id);
            const booking = await this.bookingService.GetBookingById(bookingId);
            res.status(200).json({ data: booking, message: "Booking fetched" });
        } catch (error) {
            next(error);
        }
    };

    public updateBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const bookingId = Number(req.params.id);
            const bookingData: Partial<BookingDto> = req.body;
            const updatedBooking = await this.bookingService.UpdateBooking(bookingId, bookingData);
            res.status(200).json({ data: updatedBooking, message: "Booking updated" });
        } catch (error) {
            next(error);
        }
    };

    public deleteBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const bookingId = req.body.id;
            const deletedBooking = await this.bookingService.SoftDeleteBooking(bookingId);
            res.status(200).json({ data: deletedBooking, message: "Booking deleted" });
        } catch (error) {
            next(error);
        }
    };

    public getUserBookingHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = parseInt(req.params.userId, 10);
            if (!userId) {
                res.status(400).json({ message: "Invalid user ID" });
                return;
            }

            const result = await this.bookingService.getUserBookingHistory(userId);
            res.status(200).json({ message: "Booking history fetched", data: result });
        } catch (error) {
            next(error);
        }
    };

    public getTicketsByBookingId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const bookingId = parseInt(req.params.bookingId, 10);
            const tickets = await this.bookingService.GetTicketsByBookingId(bookingId);

            res.status(200).json({
                data: tickets,
                message: "Tickets for booking fetched successfully"
            });
        } catch (error) {
            next(error);
        }
    };
}

export default BookingController;
