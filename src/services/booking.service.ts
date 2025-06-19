import { BookingDto } from "../dtos/booking.dto";
import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import { createCanvas, loadImage } from "canvas";
import bwipjs from "bwip-js";
import { format } from "date-fns";
import sendEmail from "../utils/email";
import QrCode from "qrcode-reader";
import Jimp from 'jimp';

class BookingService {
    public async GetAllActiveBookings(): Promise<any[]> {
        const bookingsWithEventData = await DB(T.BOOKINGS_TABLE)
            .join(T.EVENT_TABLE, `${T.BOOKINGS_TABLE}.event_id`, '=', `${T.EVENT_TABLE}.event_id`)
            .select(
                `${T.BOOKINGS_TABLE}.*`,
                `${T.EVENT_TABLE}.event_title`,
                `${T.EVENT_TABLE}.venue_name`,
                `${T.EVENT_TABLE}.date`
            )
            .where(`${T.BOOKINGS_TABLE}.is_deleted`, false)
            .orderBy(`${T.BOOKINGS_TABLE}.created_at`, 'desc');

        return bookingsWithEventData;
    }

    public async GetAllAllTickets(): Promise<any[]> {
        const ticketsWithBookingAndEvent = await DB("ticket_details")
            .join(T.BOOKINGS_TABLE, "ticket_details.booking_id", "=", `${T.BOOKINGS_TABLE}.booking_id`)
            .join(T.EVENT_TABLE, `${T.BOOKINGS_TABLE}.event_id`, "=", `${T.EVENT_TABLE}.event_id`)
            .select(
                "ticket_details.*",
                `${T.BOOKINGS_TABLE}.ticket_id as main_ticket_id`,
                `${T.BOOKINGS_TABLE}.email_address as booking_email`,
                `${T.BOOKINGS_TABLE}.booking_status`,
                `${T.BOOKINGS_TABLE}.total_amount`,
                `${T.EVENT_TABLE}.event_title`,
                `${T.EVENT_TABLE}.venue_name`,
                `${T.EVENT_TABLE}.date`
            )
            .where("ticket_details.is_active", true)
            .orderBy("ticket_details.created_at", "desc");

        return ticketsWithBookingAndEvent;
    }

    public async InsertBooking(data: BookingDto): Promise<any> {
        if (isEmpty(data)) {
            throw new HttpException(400, "Booking data is empty");
        }

        const mainTicketId = `NE${Math.floor(10000 + Math.random() * 90000)}`;
        data.ticket_id = mainTicketId;

        const insertedBooking = await DB(T.BOOKINGS_TABLE).insert(data).returning("*");
        const booking = insertedBooking[0];

        const event = await DB(T.EVENT_TABLE).where({ event_id: booking.event_id }).first();
        if (!event) throw new HttpException(404, "Event not found");

        const qrCodeDirectory = path.join(__dirname, "../uploads/qr_codes");
        const ticketDirectory = path.join(__dirname, "../uploads/tickets");
        if (!fs.existsSync(qrCodeDirectory)) fs.mkdirSync(qrCodeDirectory, { recursive: true });
        if (!fs.existsSync(ticketDirectory)) fs.mkdirSync(ticketDirectory, { recursive: true });

        const ticketDetailsData = [];

        for (let i = 0; i < booking.quantity; i++) {
            const uniqueTicketId = `NE${Math.floor(10000 + Math.random() * 90000)}`;

            const qrData = {
                ticket_id: uniqueTicketId,
                name: booking.name,
                email_address: booking.email_address,
                quantity: 1,
                event_id: event.event_id,
                event_title: event.event_title,
                venue_name: event.venue_name,
                date: event.date,
                time: event.time
            };

            const qrImagePath = path.join(qrCodeDirectory, `ticket_${uniqueTicketId}.png`);
            await QRCode.toFile(qrImagePath, JSON.stringify(qrData));

            const ticketImagePath = await this.generateTicketImage(
                { ...booking, ticket_id: uniqueTicketId },
                event,
                qrImagePath
            );

            ticketDetailsData.push({
                booking_id: booking.booking_id,
                ticket_id: uniqueTicketId,
                ticket_type: data.ticket_type,
                customer_name: booking.name,
                customer_email: booking.email_address,
                customer_phone: booking.phone_number,
                status: "confirmed",
                ticket_image_path: ticketImagePath,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            });
        }

        await DB("ticket_details").insert(ticketDetailsData);

        const updatedBooking = await DB(T.BOOKINGS_TABLE)
            .where({ booking_id: booking.booking_id })
            .update({ ticket_download_link: ticketDetailsData[0].ticket_image_path })
            .returning("*");

        await sendEmail(booking.email_address, ticketDetailsData[0].ticket_image_path, booking);

        return {
            booking: updatedBooking[0],
            tickets: ticketDetailsData,
            message: "Booking inserted with unique QR & tickets"
        };
    }

    public async ScanAndMarkBooking(payload: { base64_image?: string; ticket_id?: string }): Promise<any> {
        let ticketId = payload.ticket_id;

        if (!ticketId && payload.base64_image) {
            const buffer = Buffer.from(payload.base64_image.replace(/^data:image\/\w+;base64,/, ""), "base64");
            // Use Jimp to read the buffer
            let image: any;
            try {
                image = await Jimp.read(buffer);
            } catch (error) {
                throw new HttpException(400, "Failed to read image: " + error.message);
            }

            ticketId = await new Promise((resolve, reject) => {
                const qr = new QrCode();
                qr.callback = (err: any, value: any) => {
                    if (err || !value) return reject(new HttpException(400, "QR code decoding failed: " + (err?.message || "Unknown error")));
                    try {
                        const data = JSON.parse(value.result);
                        resolve(data.ticket_id || value.result);
                    } catch {
                        resolve(value.result);
                    }
                };
                qr.decode(image.bitmap);
            });
        }

        if (!ticketId) throw new HttpException(400, "Ticket ID not found");

        const booking = await DB(T.TICKET_DETAILS_TABLE)
            .where({ ticket_id: ticketId })
            .first();

        if (!booking) throw new HttpException(404, "Booking not found");

        if (booking.is_present) {
            throw new HttpException(409, "Already checked in");
        }

        const updated = await DB(T.TICKET_DETAILS_TABLE)
            .where({ ticket_id: ticketId })
            .update({ is_present: true, check_in_time: new Date() })
            .returning("*");

        return updated[0];
    }

    private async generateTicketImage(booking: any, event: any, qrImagePath: string): Promise<string> {
        const width = 400;
        const height = 900;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");

        const posterImage = await loadImage(path.join(__dirname, "../assets/poster.jpg"));
        const formattedDate = format(new Date(event.date), "EEE, dd MMM yyyy");
        const formattedTime = format(new Date(`1970-01-01T${event.time}`), "hh:mm a");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, 80);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px Arial";
        ctx.fillText(`Ticket ID: ${booking.ticket_id}`, 20, 50);

        ctx.drawImage(posterImage, 0, 80, width, 220);

        ctx.fillStyle = "#f4f4f4";
        ctx.fillRect(0, 300, width, 280);
        ctx.fillStyle = "#000000";
        ctx.font = "bold 20px Arial";
        ctx.fillText(event.event_title, 20, 340);

        ctx.font = "18px Arial";
        ctx.fillText("Date", 20, 370);
        ctx.fillText(formattedDate, 110, 370);

        ctx.fillText("Time", 20, 400);
        ctx.fillText(formattedTime, 110, 400);

        ctx.fillText("Venue", 20, 430);
        ctx.fillText(event.venue_name, 110, 430);

        ctx.fillText("Name", 20, 460);
        ctx.fillText(booking.name, 110, 460);

        ctx.fillText("Email", 20, 490);
        ctx.fillText(booking.email_address, 110, 490);

        ctx.fillText("Ticket No.", 20, 520);
        ctx.fillText(booking.ticket_id, 110, 520);

        const qrImage = await loadImage(qrImagePath);
        ctx.drawImage(qrImage, width / 2 - 100, 600, 200, 200);

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, height - 60, width, 60);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px Arial";
        ctx.fillText("Your Company Name", 20, height - 25);

        const ticketImagePath = path.join(__dirname, `../uploads/tickets/ticket_${booking.ticket_id}.jpg`);
        const buffer = canvas.toBuffer("image/jpeg");
        fs.writeFileSync(ticketImagePath, buffer);

        return ticketImagePath;
    }

    public async GetBookingById(booking_id: number): Promise<any> {
        if (!booking_id) throw new HttpException(400, "Booking ID is required");

        const booking = await DB(T.BOOKINGS_TABLE).where({ booking_id }).first();
        if (!booking) throw new HttpException(404, "Booking not found");

        return booking;
    }

    public async UpdateBooking(booking_id: number, data: Partial<BookingDto>): Promise<any> {
        if (!booking_id) throw new HttpException(400, "Booking ID is required");
        if (isEmpty(data)) throw new HttpException(400, "Update data is empty");

        data.updated_at = new Date();

        const updated = await DB(T.BOOKINGS_TABLE)
            .where({ booking_id })
            .update(data)
            .returning("*");

        if (!updated.length) throw new HttpException(404, "Booking not found or not updated");

        return updated[0];
    }

    public async SoftDeleteBooking(booking_id: number): Promise<any> {
        if (!booking_id) throw new HttpException(400, "Booking ID is required");

        const update = {
            is_deleted: true,
            deleted_by: 1,
            deleted_at: new Date()
        };

        const deleted = await DB(T.BOOKINGS_TABLE)
            .where({ booking_id })
            .update(update)
            .returning("*");

        if (!deleted.length) throw new HttpException(404, "Booking not found or already deleted");

        return deleted[0];
    }
}

export default BookingService;