import DB from "../database/index.schema";
import { EventDto } from "../dtos/event.dto";
import { NextFunction, Request, Response } from "express";
import EventService from "../services/event.service";


class EventController {
    public eventService = new EventService();

    public getAllActiveEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const events = await this.eventService.GetAllActiveEvents();
            res.status(200).json({ data: events, message: "Active events fetched" });
        } catch (error) {
            next(error);
        }
    };

    public insertevent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const eventData: EventDto = req.body;
            const insertedEvent = await this.eventService.InsertEvent(eventData);
            res.status(201).json({ data: insertedEvent, message: "Inserted" });
        } catch (error) {
            next(error);
        }
    };

    public getEventById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const eventId = Number(req.params.id);
            const event = await this.eventService.GetEventById(eventId);
            res.status(200).json({ data: event, message: "Event fetched" });
        } catch (error) {
            next(error);
        }
    };

    public updateEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const eventId = Number(req.params.id);
            const eventData: Partial<EventDto> = req.body;
            const updatedEvent = await this.eventService.UpdateEvent(eventId, eventData);
            res.status(200).json({ data: updatedEvent, message: "Event updated" });
        } catch (error) {
            next(error);
        }
    };

    public deleteEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { event_id, ...deleteData } = req.body;
            const deletedEvent = await this.eventService.SoftDeleteEvent(event_id, deleteData);
            res.status(200).json({ data: deletedEvent, message: "Event deleted" });
        } catch (error) {
            next(error);
        }
    };
}

export default EventController;
