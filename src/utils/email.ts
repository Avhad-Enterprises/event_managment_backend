import nodemailer from "nodemailer";

const sendEmail = async (to: string, ticketImagePath: string, booking: any) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // Define the email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: "Your Event Booking Confirmation",
            text: `Dear ${booking.name},\n\nThank you for booking with us! Please find your ticket attached.\n\nEvent: ${booking.event_title}\nDate: ${booking.date}\n\nBest regards,\nYour Event Team`,
            html: `<p>Dear ${booking.name},</p>
                    <p>Thank you for booking with us! Please find your ticket attached.</p>
                    <p><b>Event:</b> ${booking.event_title}</p>
                    <p><b>Date:</b> ${booking.date}</p>
                    <p>Best regards,<br>Your Event Team</p>`,
            attachments: [
                {
                    filename: `ticket_${booking.booking_id}.jpg`,
                    path: ticketImagePath,
                    cid: "ticketimage@cid",
                },
            ],
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to:", to);
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Error sending email");
    }
};

export default sendEmail;
