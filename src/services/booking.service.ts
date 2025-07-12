import { BookingDto } from "../dtos/booking.dto";
import DB, { T } from "../database/index.schema";
import HttpException from "../exceptions/HttpException";
import { isEmpty } from "../utils/util";
import QRCode from "qrcode";
import path from "path";
import fs from "fs";
import { createCanvas, loadImage, CanvasRenderingContext2D } from "canvas";
import bwipjs from "bwip-js";
import { format } from "date-fns";
import sendEmailWithZip from "../utils/email";
import QrCode from "qrcode-reader";
import Jimp from 'jimp';
import { uploadToAws } from "../utils/util";
import archiver from "archiver";
import axios from "axios";
import stream from "stream";

class BookingService {
    public async GetAllActiveBookings(): Promise<any[]> {
        const bookingsWithDetails = await DB(T.BOOKINGS_TABLE)
            .leftJoin(T.EVENT_TABLE, `${T.BOOKINGS_TABLE}.event_id`, '=', `${T.EVENT_TABLE}.event_id`)
            .leftJoin(T.USERS_TABLE, `${T.BOOKINGS_TABLE}.user_id`, '=', `${T.USERS_TABLE}.user_id`)
            .select(
                `${T.BOOKINGS_TABLE}.*`,
                `${T.EVENT_TABLE}.event_title`,
                `${T.EVENT_TABLE}.venue_name`,
                `${T.EVENT_TABLE}.date`,
                `${T.USERS_TABLE}.first_name as user_first_name`,
                `${T.USERS_TABLE}.last_name as user_last_name`,
                `${T.USERS_TABLE}.email as user_email`,
                `${T.USERS_TABLE}.user_id as linked_user_id`
            )
            .where(`${T.BOOKINGS_TABLE}.is_deleted`, false)
            .orderBy(`${T.BOOKINGS_TABLE}.created_at`, 'desc');

        return bookingsWithDetails;
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

    public async InsertBooking(data: BookingDto, loggedInUser?: any): Promise<any> {
        if (isEmpty(data)) throw new HttpException(400, "Booking data is empty");
        if (!Array.isArray(data.ticket_holders) || data.ticket_holders.length !== data.quantity) {
            throw new HttpException(400, "Ticket holder data must match quantity");
        }

        let ticketHolders = data.ticket_holders;

        // If user is logged in, auto-fill first ticket
        if (loggedInUser?.id) {
            const user = await DB(T.USERS_TABLE)
                .select("first_name", "last_name", "email", "phone_number")
                .where({ user_id: loggedInUser.id })
                .first();

            if (!user) throw new HttpException(404, "User not found");

            // Replace first ticket holder with logged-in user
            ticketHolders[0] = {
                name: `${user.first_name} ${user.last_name}`,
                email: user.email,
                phone_number: user.phone_number,
                location: ticketHolders[0]?.location || null
            };
        }

        let ticketHoldersJson: string | undefined;
        if (data.ticket_holders) {
            ticketHoldersJson = JSON.stringify(data.ticket_holders);
        }

        const bookingInsertData = {
            event_id: data.event_id,
            ticket_type: data.ticket_type,
            quantity: data.quantity,
            ticket_price: data.ticket_price,
            total_amount: data.total_amount,
            booking_status: data.booking_status,
            terms_and_conditions: data.terms_and_conditions,
            notify_via_email_sms: data.notify_via_email_sms,
            is_active: data.is_active ?? true,
            created_by: loggedInUser?.id || 0,
            user_id: loggedInUser?.id || null,
            ticket_holders: JSON.stringify(ticketHolders),
            created_at: new Date(),
            updated_at: new Date()
        };

        const insertedBooking = await DB(T.BOOKINGS_TABLE)
            .insert(bookingInsertData)
            .returning("*");

        const booking = insertedBooking[0];

        const event = await DB(T.EVENT_TABLE)
            .select("*")
            .where({ event_id: booking.event_id })
            .first();

        if (!event) throw new HttpException(404, "Event not found");

        const qrCodeDirectory = path.join(__dirname, "../uploads/qr_codes");
        if (!fs.existsSync(qrCodeDirectory)) fs.mkdirSync(qrCodeDirectory, { recursive: true });

        const ticketDetailsData = [];

        for (let i = 0; i < data.quantity; i++) {
            const uniqueTicketId = await this.generateUniqueTicketId();
            const holder = ticketHolders[i];

            const qrData = {
                ticket_id: uniqueTicketId,
                name: holder.name,
                email_address: holder.email,
                quantity: 1,
                event_id: event.event_id,
                event_title: event.event_title,
                venue_name: event.venue_name,
                date: event.date,
                time: event.time
            };

            const qrImagePath = path.join(qrCodeDirectory, `ticket_${uniqueTicketId}.png`);
            await QRCode.toFile(qrImagePath, JSON.stringify(qrData));

            const { buffer, filename } = await this.generateTicketImageBase64(
                { ...holder, ticket_id: uniqueTicketId },
                event,
                qrImagePath
            );

            const base64String = `data:image/jpeg;base64,${buffer.toString("base64")}`;
            const awsUpload = await uploadToAws(filename, base64String);
            const ticketImagePath = awsUpload.fileUrl;

            ticketDetailsData.push({
                booking_id: booking.booking_id,
                ticket_id: uniqueTicketId,
                ticket_type: data.ticket_type,
                customer_name: holder.name,
                customer_email: holder.email,
                customer_phone: holder.phone_number,
                location: holder.location,
                status: "confirmed",
                ticket_image_path: ticketImagePath,
                is_active: true,
                created_at: new Date(),
                updated_at: new Date()
            });
        }

        await DB("ticket_details").insert(ticketDetailsData);

        await DB(T.BOOKINGS_TABLE)
            .where({ booking_id: booking.booking_id })
            .update({ ticket_download_link: ticketDetailsData[0].ticket_image_path });

        const zipBuffer = await this.downloadAndZipTickets(ticketDetailsData.map(t => t.ticket_image_path));

        await sendEmailWithZip(ticketHolders[0].email, zipBuffer, {
            ...booking,
            name: ticketHolders[0].name,
            event_title: event.event_title,
            date: format(event.date, "EEE, dd MMM yyyy")
        });

        return {
            booking,
            tickets: ticketDetailsData,
            message: "Booking inserted with multiple ticket holders"
        };
    }

    private async downloadAndZipTickets(ticketUrls: string[]): Promise<Buffer> {
        const archive = archiver("zip", { zlib: { level: 9 } });
        const bufferStream = new stream.PassThrough();
        archive.pipe(bufferStream);

        for (const url of ticketUrls) {
            const fileResponse = await axios.get(url, { responseType: "arraybuffer" });
            const fileName = url.split("/").pop() || `ticket_${Date.now()}.jpg`;
            const buffer = Buffer.from(fileResponse.data as ArrayBuffer);
            archive.append(buffer, { name: fileName });
        }

        archive.finalize();

        const chunks: any[] = [];
        return new Promise((resolve, reject) => {
            bufferStream.on("data", (chunk) => chunks.push(chunk));
            bufferStream.on("end", () => resolve(Buffer.concat(chunks)));
            bufferStream.on("error", reject);
        });
    }

    private async generateUniqueTicketId(): Promise<string> {
        let ticketId: string;
        let isDuplicate = true;

        while (isDuplicate) {
            ticketId = `NE${Math.floor(10000 + Math.random() * 90000)}`;
            const existing = await DB(T.TICKET_DETAILS_TABLE).where({ ticket_id: ticketId }).first();
            if (!existing) isDuplicate = false;
        }

        return ticketId;
    }

    private async generateTicketImageBase64(
        booking: any,
        event: any,
        qrImagePath: string
    ): Promise<{ buffer: Buffer; filename: string }> {
        const width = 400;

        // Temporary height for initial canvas (will be adjusted dynamically later)
        const tempCanvas = createCanvas(width, 1000);
        const tempCtx = tempCanvas.getContext("2d");

        // Format date and time
        const formattedDate = format(new Date(event.date), "EEE, dd MMM yyyy");
        let formattedTime = "All Day";
        if (!event.all_day && event.time) {
            try {
                formattedTime = format(new Date(`1970-01-01T${event.time}`), "hh:mm a");
            } catch {
                formattedTime = "Time Invalid";
            }
        }

        // Load banner and QR image
        const posterImage = await loadImage(event.banner_image);
        const qrImage = await loadImage(qrImagePath);

        // --- Calculate title line height
        tempCtx.font = "bold 20px Arial";
        const titleLines = this.getWrappedTextLines(tempCtx, event.event_title, width - 40);
        const titleHeight = titleLines.length * 24;

        // Estimate full canvas height
        const baseY = 340 + titleHeight + 10;
        const contentBlockHeight = 180 + 200 + 60 + 40;
        const footerHeight = 60;
        const totalHeight = baseY + contentBlockHeight + footerHeight;
        const height = Math.max(900, totalHeight);

        // Create actual canvas
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext("2d");

        // Background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        // Header
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, 80);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 20px Arial";
        ctx.fillText(`Ticket ID: ${booking.ticket_id}`, 20, 50);

        // Banner Image
        ctx.drawImage(posterImage, 0, 80, width, 220);

        // Event Info Background
        ctx.fillStyle = "#f4f4f4";
        ctx.fillRect(0, 300, width, baseY - 300 + 180);

        // Event Title
        ctx.fillStyle = "#000000";
        ctx.font = "bold 20px Arial";
        this.drawWrappedText(ctx, event.event_title, 20, 340, width - 40, 24);

        // Shifted content
        ctx.font = "18px Arial";
        ctx.fillText("Date", 20, baseY);
        ctx.fillText(formattedDate, 110, baseY);

        ctx.fillText("Time", 20, baseY + 30);
        ctx.fillText(formattedTime, 110, baseY + 30);

        ctx.fillText("Venue", 20, baseY + 60);
        ctx.fillText(event.venue_name, 110, baseY + 60);

        ctx.fillText("Name", 20, baseY + 90);
        ctx.fillText(booking.name, 110, baseY + 90);

        ctx.fillText("Ticket ID.", 20, baseY + 150);
        ctx.fillText(booking.ticket_id, 110, baseY + 150);

        // QR Code
        const qrY = baseY + 180;
        ctx.drawImage(qrImage, width / 2 - 100, qrY, 200, 200);

        // Footer
        const footerY = qrY + 200 + 40;
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, footerY, width, 60);
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 18px Arial";
        ctx.fillText("Your Company Name", 20, footerY + 35);

        const buffer = canvas.toBuffer("image/jpeg");
        const filename = `ticket_${booking.ticket_id}.jpg`;

        return { buffer, filename };
    }

    private getWrappedTextLines(
        ctx: CanvasRenderingContext2D,
        text: string,
        maxWidth: number
    ): string[] {
        const words = text.split(" ");
        const lines: string[] = [];
        let line = "";

        for (let i = 0; i < words.length; i++) {
            const testLine = line + words[i] + " ";
            const { width: testWidth } = ctx.measureText(testLine);
            if (testWidth > maxWidth && i > 0) {
                lines.push(line.trim());
                line = words[i] + " ";
            } else {
                line = testLine;
            }
        }
        lines.push(line.trim());
        return lines;
    }

    private drawWrappedText(
        ctx: CanvasRenderingContext2D,
        text: string,
        x: number,
        y: number,
        maxWidth: number,
        lineHeight: number
    ): void {
        const lines = this.getWrappedTextLines(ctx, text, maxWidth);
        lines.forEach((line, index) => {
            ctx.fillText(line, x, y + index * lineHeight);
        });
    }

    public async ScanAndMarkBooking(payload: { ticket_id: string }): Promise<any> {
        const ticketId = payload.ticket_id;

        if (!ticketId) throw new HttpException(400, "Ticket ID is required");

        const booking = await DB(T.TICKET_DETAILS_TABLE)
            .where({ ticket_id: ticketId })
            .first();

        if (!booking) throw new HttpException(404, "Booking not found");

        if (booking.is_present) {
            throw new HttpException(409, "Already checked in");
        }

        const updated = await DB(T.TICKET_DETAILS_TABLE)
            .where({ ticket_id: ticketId })
            .update({
                is_present: true,
                check_in_time: new Date()
            })
            .returning("*");

        return updated[0];
    }

    public async GetBookingById(booking_id: number): Promise<any> {
        if (!booking_id) throw new HttpException(400, "Booking ID is required");

        const booking = await DB(`${T.BOOKINGS_TABLE} as b`)
            .leftJoin(`${T.EVENT_TABLE} as e`, 'b.event_id', 'e.event_id')
            .leftJoin(`${T.USERS_TABLE} as u`, 'b.user_id', 'u.user_id')
            .select(
                'b.*',
                // Event Info
                'e.event_title',
                'e.event_description',
                'e.banner_image',
                'e.date as event_date',
                'e.time as event_time',
                'e.venue_name',
                // User Info
                'u.first_name as user_first_name',
                'u.last_name as user_last_name',
                'u.email as user_email',
                'u.phone_number as user_phone_number',
                'u.profile_picture as user_profile_picture'
            )
            .where('b.booking_id', booking_id)
            .first();

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

    public async getUserBookingHistory(userId: number): Promise<any[]> {
        const bookings = await DB(T.BOOKINGS_TABLE)
            .where({ user_id: userId })
            .orderBy("created_at", "desc");

        if (!bookings.length) return [];

        const bookingIds = bookings.map(b => b.booking_id);

        const tickets = await DB(T.TICKET_DETAILS_TABLE)
            .whereIn("booking_id", bookingIds);

        const ticketsByBooking: Record<number, any[]> = {};
        for (const ticket of tickets) {
            if (!ticketsByBooking[ticket.booking_id]) {
                ticketsByBooking[ticket.booking_id] = [];
            }
            ticketsByBooking[ticket.booking_id].push(ticket);
        }

        const result = bookings.map(booking => ({
            ...booking,
            tickets: ticketsByBooking[booking.booking_id] || []
        }));

        return result;
    }

    public async GetTicketsByBookingId(booking_id: number): Promise<any[]> {
        if (!booking_id) {
            throw new HttpException(400, "Booking ID is required");
        }

        const tickets = await DB(T.TICKET_DETAILS_TABLE)
            .where("booking_id", booking_id)
            .andWhere("is_active", true)
            .orderBy("created_at", "asc");

        return tickets;
    }
}

export default BookingService;