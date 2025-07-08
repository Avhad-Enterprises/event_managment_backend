import { EventDto } from "../dtos/event.dto";
import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";

class EventService {
    public async GetAllActiveEvents(): Promise<any[]> {
        const events = await DB(T.EVENT_TABLE)
            .where({ is_deleted: false })
            .orderBy('date', 'asc')
            .orderBy('time', 'asc');

        const formattedEvents = events.map(event => ({
            ...event,
            date_and_time: `${event.date} ${event.time}`
        }));

        return formattedEvents;
    }

    public async InsertEvent(data: EventDto): Promise<any> {
        if (isEmpty(data)) {
            throw new HttpException(400, "Event data is empty");
        }
        const insertedEvent = await DB(T.EVENT_TABLE).insert(data).returning("*");
        return insertedEvent[0];
    }

    public async GetEventById(event_id: number): Promise<any> {
        if (!event_id) throw new HttpException(400, "Event ID is required");

        const event = await DB(T.EVENT_TABLE).where({ event_id }).first();
        if (!event) throw new HttpException(404, "Event not found");

        return event;
    }

    public async UpdateEvent(event_id: number, data: Partial<EventDto>): Promise<any> {
        if (!event_id) throw new HttpException(400, "Event ID is required");
        if (isEmpty(data)) throw new HttpException(400, "Update data is empty");

        data.updated_at = new Date();

        const updated = await DB(T.EVENT_TABLE)
            .where({ event_id })
            .update(data)
            .returning("*");

        if (!updated.length) throw new HttpException(404, "Event not found or not updated");

        return updated[0];
    }

    public async SoftDeleteEvent(event_id: number, data: Partial<EventDto>): Promise<any> {
        if (!event_id) throw new HttpException(400, "Event ID is required");
        if (isEmpty(data)) throw new HttpException(400, "Delete data is empty");
        const updated = await DB(T.EVENT_TABLE)
            .where({ event_id })
            .update(data)
            .returning("*");

        if (!updated.length) throw new HttpException(404, "Event not found or already deleted");

        return updated[0];
    }

    public async getEventByMetaUrl(meta_url: string): Promise<any> {
        if (!meta_url) throw new HttpException(400, "Meta URL is required");

        const event = await DB(T.EVENT_TABLE)
            .where({ meta_url, is_deleted: false })
            .first();

        if (!event) throw new HttpException(404, "Event not found with given meta_url");

        return {
            ...event,
            date_and_time: `${event.date} ${event.time}`,
        };
    }

}

export default EventService;
