import nodemailer from 'nodemailer';
import 'dotenv/config';

const smtpUser = (process.env.SMTP_USER || '').trim().replace(/^['"]|['"]$/g, '');
const smtpPass = (process.env.SMTP_PASS || '').trim().replace(/^['"]|['"]$/g, '');
const smtpHost = (process.env.SMTP_HOST || '').trim().replace(/^['"]|['"]$/g, '');
const mailService = (process.env.MAIL_SERVICE || '').trim().toLowerCase();

let transportOptions;

// 1. Gmail configuration (e.g. MAIL_SERVICE=gmail or smtp.gmail.com)
if (mailService === 'gmail' || smtpHost.includes('gmail') || (smtpUser.endsWith('@gmail.com') && !smtpHost.includes('brevo'))) {
    transportOptions = {
        service: 'gmail',
        auth: {
            user: smtpUser,
            pass: smtpPass,
        }
    };
}
// 2. Custom SMTP host
else if (smtpHost && !smtpHost.includes('brevo')) {
    transportOptions = {
        host: smtpHost,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
            user: smtpUser,
            pass: smtpPass,
        }
    };
}
// 3. Brevo (Sendinblue) relay
else {
    transportOptions = {
        host: "smtp-relay.brevo.com",
        port: Number(process.env.SMTP_PORT) || 587,
        secure: false, // port 587 uses STARTTLS
        auth: {
            user: smtpUser,
            pass: smtpPass,
        }
    };
}

const transporter = nodemailer.createTransport(transportOptions);

// Helper to get clean sender email
export const getSenderEmail = () => {
    const raw = (process.env.SENDER_EMAIL || process.env.SMTP_USER || '').trim().replace(/^['"]|['"]$/g, '');
    if (!raw) return 'shaikafroz2903@gmail.com';
    return raw.replace(/^user\./i, '');
};

// Reusable function to send booking & payment confirmation emails
export const sendBookingEmail = async ({ booking, hotelName, roomType, guestName, recipientEmail, isPaid = false }) => {
    if (!recipientEmail) {
        console.warn("sendBookingEmail: No recipient email provided");
        return;
    }

    const senderEmail = getSenderEmail();
    const statusText = isPaid ? "Paid (Online)" : "Pending (Pay at hotel)";
    const subject = isPaid
        ? "Your QuickStay Booking & Payment Confirmed!"
        : "Your QuickStay Booking is Confirmed!";

    const mailOptions = {
        from: `"QuickStay" <${senderEmail}>`,
        to: recipientEmail,
        subject,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333;">
                <h1 style="color: #2563eb;">QuickStay</h1>
                <h2>${isPaid ? 'Payment Successful & Booking Confirmed!' : 'Booking Confirmation'}</h2>

                <p>Dear ${guestName || "Guest"},</p>

                <p>${isPaid
                    ? 'Thank you for choosing QuickStay! Your payment has been received and your reservation is confirmed.'
                    : 'Thank you for choosing QuickStay! Your booking has been successfully recorded.'}</p>

                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
                    <h3 style="margin-top: 0;">Reservation Details</h3>

                    <p><strong>Booking ID:</strong> ${booking._id}</p>
                    <p><strong>Hotel:</strong> ${hotelName || 'Hotel'}</p>
                    <p><strong>Room:</strong> ${roomType || 'Room'}</p>
                    <p><strong>Check-in:</strong> ${new Date(booking.checkInDate).toDateString()}</p>
                    <p><strong>Check-out:</strong> ${new Date(booking.checkOutDate).toDateString()}</p>
                    <p><strong>Guests:</strong> ${booking.guests}</p>
                    <p><strong>Total Price:</strong> $${booking.totalPrice}</p>
                    <p><strong>Payment Status:</strong> <span style="color: ${isPaid ? '#16a34a' : '#ea580c'}; font-weight: bold;">${statusText}</span></p>
                </div>

                <p style="margin-top: 20px;">Please keep this email for your records.</p>

                <p>If you have any questions, reach out to us at:
                <a href="mailto:${senderEmail}">${senderEmail}</a></p>

                <p>We look forward to welcoming you!</p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

                <p style="color: #777; font-size: 12px;">
                    © 2026 QuickStay. All rights reserved.
                </p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Confirmation email delivered to ${recipientEmail}:`, info.messageId);
        return info;
    } catch (err) {
        console.error("Email delivery failed:", err.message);
        if (err.message && err.message.includes('525')) {
            console.error("================================================================================");
            console.error("BREVO IP RESTRICTION NOTICE (Error 525 5.7.1 Unauthorized IP address):");
            console.error("Brevo is blocking this connection because your current public IP is not authorized.");
            console.error("Fix 1: Go to Brevo Dashboard -> Settings -> Authorized IPs, and add your IP.");
            console.error("Fix 2: Switch to Gmail in server/.env by setting:");
            console.error("       MAIL_SERVICE=gmail");
            console.error("       SMTP_USER=shaikafroz2903@gmail.com");
            console.error("       SMTP_PASS=<16-digit-google-app-password>");
            console.error("================================================================================");
        }
        throw err;
    }
};

export default transporter;
