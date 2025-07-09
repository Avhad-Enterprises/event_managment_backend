import nodemailer from "nodemailer";

/**
 * Send a ZIP file of tickets via email
 * @param to Email address of the recipient
 * @param zipBuffer Buffer of the zipped ticket images
 * @param booking Booking data (used for name, event, date info)
 */
const sendEmailWithZip = async (to: string, zipBuffer: Buffer, booking: any) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: "Your Event Tickets - Booking Confirmation",
            text: `Dear ${booking.name},\n\nThank you for booking with us! Please find all your tickets attached in a ZIP file.\n\nEvent: ${booking.event_title}\nDate: ${booking.date}\n\nBest regards,\nYour Event Team`,
            html: `<p>Dear ${booking.name},</p>
                   <p>Thank you for booking with us! Please find all your tickets attached in a ZIP file.</p>
                   <p><b>Event:</b> ${booking.event_title}</p>
                   <p><b>Date:</b> ${booking.date}</p>
                   <p>Best regards,<br>Your Event Team</p>`,
            attachments: [
                {
                    filename: `tickets_${booking.booking_id || Date.now()}.zip`,
                    content: zipBuffer,
                    contentType: "application/zip",
                },
            ],
        };

        await transporter.sendMail(mailOptions);
        console.log("Email with ZIP sent successfully to:", to);
    } catch (error) {
        console.error("Error sending email with ZIP:", error);
        throw new Error("Error sending email with ZIP");
    }
};

export default sendEmailWithZip;
