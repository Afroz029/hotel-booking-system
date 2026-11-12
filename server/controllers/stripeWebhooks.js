import stripe from 'stripe';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';
import transporter, { getSenderEmail, sendBookingEmail } from '../configs/nodemailer.js';

export const stripeWebhook = async (req, res) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error("Stripe Webhook Verification Error:", error.message);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    try {
        let bookingId = null;

        // 1. Handle checkout.session.completed (primary Stripe Checkout event)
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            bookingId = session.metadata?.bookingId;
        }
        // 2. Handle payment_intent.succeeded as fallback
        else if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            const sessions = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            if (sessions.data && sessions.data.length > 0) {
                bookingId = sessions.data[0].metadata?.bookingId;
            }
        } else {
            console.log("Unhandled Stripe event type:", event.type);
        }

        // If a bookingId was found, update database and send confirmation email
        if (bookingId) {
            const updatedBooking = await Booking.findByIdAndUpdate(
                bookingId,
                { isPaid: true, status: 'confirmed', paymentMethod: 'Stripe' },
                { new: true }
            ).populate('room hotel user');

            if (updatedBooking) {
                console.log(`Booking ${bookingId} marked as paid via Stripe webhook.`);

                try {
                    await sendBookingEmail({
                        booking: updatedBooking,
                        hotelName: updatedBooking.hotel?.name,
                        roomType: updatedBooking.room?.roomType,
                        guestName: updatedBooking.user?.username,
                        recipientEmail: updatedBooking.user?.email,
                        isPaid: true
                    });
                } catch (emailError) {
                    console.error("Webhook payment email delivery failed:", emailError.message);
                }
            }
        }

        res.json({ received: true });
    } catch (err) {
        console.error("Error processing Stripe webhook:", err);
        res.status(500).json({ error: err.message });
    }
};
