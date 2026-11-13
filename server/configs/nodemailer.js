import 'dotenv/config';

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// Helper to get verified sender email address
export const getSenderEmail = () => {
    const raw = (process.env.SENDER_EMAIL || '').trim().replace(/^['"]|['"]$/g, '');
    if (raw && !raw.includes('@smtp-brevo.com') && raw.includes('@')) {
        return raw;
    }
    const smtp = (process.env.SMTP_USER || '').trim().replace(/^['"]|['"]$/g, '');
    if (smtp && !smtp.includes('@smtp-brevo.com') && smtp.includes('@')) {
        return smtp;
    }
    return 'shaikafroz2903@gmail.com';
};

// Reusable function to send booking & payment confirmation emails via Brevo HTTPS API
export const sendBookingEmail = async ({
    booking,
    hotelName,
    roomType,
    guestName,
    recipientEmail,
    isPaid = false
}) => {
    if (!recipientEmail) {
        console.warn('sendBookingEmail: No recipient email provided');
        return;
    }

    const apiKey = (process.env.BREVO_API_KEY || process.env.SMTP_PASS || '').trim().replace(/^['"]|['"]$/g, '');

    if (!apiKey) {
        throw new Error('BREVO_API_KEY is missing in environment variables');
    }

    const senderEmail = getSenderEmail();
    const statusText = isPaid
        ? 'Paid (Online)'
        : 'Pending (Pay at hotel)';

    const subject = isPaid
        ? 'Your QuickStay Booking & Payment Confirmed!'
        : 'Your QuickStay Booking is Confirmed!';

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; color: #333;">
            <h1 style="color: #2563eb;">QuickStay</h1>
            <h2>${isPaid ? 'Payment Successful & Booking Confirmed!' : 'Booking Confirmation'}</h2>
            <p>Dear ${guestName || 'Guest'},</p>
            <p>${isPaid
                ? 'Your payment has been received and your reservation is confirmed.'
                : 'Your booking has been successfully recorded.'}</p>
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
            <p>Questions? Contact us at: <a href="mailto:${senderEmail}">${senderEmail}</a></p>
            <p>We look forward to welcoming you!</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #777; font-size: 12px;">© 2026 QuickStay. All rights reserved.</p>
        </div>
    `;

    const response = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            sender: {
                name: 'QuickStay',
                email: senderEmail
            },
            to: [{ email: recipientEmail }],
            subject,
            htmlContent
        })
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        console.error('Brevo API error:', response.status, result);
        throw new Error(result.message || `Brevo API failed with status ${response.status}`);
    }

    console.log(`Confirmation email sent via Brevo HTTP API to ${recipientEmail}:`, result.messageId || 'Success');

    return result;
};

// Backward-compatible dummy transporter export
export const transporter = {
    sendMail: sendBookingEmail
};

export default sendBookingEmail;
