import transporter, { getSenderEmail, sendBookingEmail } from '../configs/nodemailer.js';
import Booking from '../models/Booking.js';
import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';
import User from '../models/User.js';
import stripe from 'stripe';

// Function to check room availability
const checkAvailability = async ({ checkInDate, checkOutDate, room }) => {
    try {
        const bookings = await Booking.find({
            room,
            status: { $ne: 'cancelled' },
            checkInDate: { $lte: new Date(checkOutDate) },
            checkOutDate: { $gte: new Date(checkInDate) }
        });
        return bookings.length === 0;
    } catch (error) {
        console.error("checkAvailability error:", error.message);
        return false;
    }
};

// API to check room availability (POST /api/bookings/check-availability)
export const checkAvailabilityAPI = async (req, res) => {
    try {
        const { checkInDate, checkOutDate, room } = req.body;
        if (!checkInDate || !checkOutDate || !room) {
            return res.json({ success: false, message: "Missing required fields" });
        }
        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
        res.json({ success: true, isAvailable });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// API to create a new booking (POST /api/bookings/book)
export const createBooking = async (req, res) => {
    try {
        const { room, checkInDate, checkOutDate, guests, paymentMethod } = req.body;
        const user = req.user._id;

        const isAvailable = await checkAvailability({ checkInDate, checkOutDate, room });
        if (!isAvailable) {
            return res.json({ success: false, message: "Room is not available for the selected dates." });
        }

        // Get total price from room details
        const roomData = await Room.findById(room).populate('hotel');
        if (!roomData) {
            return res.json({ success: false, message: "Room details not found." });
        }

        let totalPrice = roomData.pricePerNight;

        // Calculate total price based on number of nights
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));

        totalPrice *= nights;

        // Create booking
        const booking = await Booking.create({
            user,
            room,
            hotel: roomData.hotel._id,
            guests: +guests || 1,
            checkInDate,
            checkOutDate,
            totalPrice,
            paymentMethod: paymentMethod || "Pay at hotel",
            status: "pending",
            isPaid: false
        });

        // Send booking confirmation email asynchronously (isolated so SMTP issue doesn't fail booking)
        try {
            await sendBookingEmail({
                booking,
                hotelName: roomData.hotel?.name,
                roomType: roomData.roomType,
                guestName: req.user?.username,
                recipientEmail: req.user?.email,
                isPaid: false
            });
        } catch (mailError) {
            console.error("Booking email sending error (booking still succeeded):", mailError.message);
        }

        res.json({ success: true, message: "Booking created successfully", booking });
    } catch (error) {
        console.error("createBooking error:", error);
        res.json({ success: false, message: error.message || "Failed to create booking" });
    }
};

// API to get all bookings for a user (GET /api/bookings/user)
export const getUserBookings = async (req, res) => {
    try {
        const user = req.user._id;
        const bookings = await Booking.find({ user }).populate('room hotel').sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (error) {
        console.error("getUserBookings error:", error);
        res.json({ success: false, message: "Failed to fetch bookings" });
    }
};

// Function to fetch bookings data for admin dashboard (GET /api/bookings/hotel)
export const getHotelBookings = async (req, res) => {
    try {
        const owner = req.user._id;
        const hotel = await Hotel.findOne({ owner });

        if (!hotel) {
            return res.json({ success: false, message: "Hotel not found" });
        }

        const bookings = await Booking.find({ hotel: hotel._id }).populate('room hotel user').sort({ createdAt: -1 });

        const totalBookings = bookings.length;
        const totalRevenue = bookings.reduce((acc, booking) => acc + booking.totalPrice, 0);

        res.json({ success: true, dashboardData: { totalBookings, totalRevenue, bookings } });
    } catch (error) {
        console.error("getHotelBookings error:", error);
        res.json({ success: false, message: "Failed to fetch hotel bookings" });
    }
};

// API to create Stripe Checkout session (POST /api/bookings/stripe-payment)
export const stripePayment = async (req, res) => {
    try {
        const { bookingId } = req.body;

        if (!bookingId) {
            return res.json({ success: false, message: "Booking ID is required" });
        }

        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.json({ success: false, message: "Booking not found" });
        }

        const roomData = await Room.findById(booking.room).populate('hotel');
        if (!roomData) {
            return res.json({ success: false, message: "Room details not found" });
        }

        const totalPrice = booking.totalPrice;
        const origin = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:5173';

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
        const line_items = [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: roomData.hotel?.name || 'Hotel Booking',
                        description: `Booking for ${roomData.roomType || 'Room'} (${booking.guests} guest${booking.guests > 1 ? 's' : ''})`,
                    },
                    unit_amount: Math.round(totalPrice * 100), // Convert to cents integer
                },
                quantity: 1,
            }
        ];

        // Create Stripe checkout session with session_id parameter in success_url
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: 'payment',
            customer_email: req.user?.email || undefined,
            success_url: `${origin}/loader/my-bookings?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/my-bookings`,
            metadata: {
                bookingId: booking._id.toString(),
            }
        });

        res.json({ success: true, url: session.url });
    } catch (error) {
        console.error("Stripe payment error:", error);
        res.json({ success: false, message: error.message || "Payment Failed!" });
    }
};

// API to verify Stripe Checkout session and mark booking as Paid (POST /api/bookings/verify-stripe)
export const verifyStripePayment = async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.json({ success: false, message: "Session ID is required" });
        }

        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
        const session = await stripeInstance.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === 'paid') {
            const bookingId = session.metadata?.bookingId;

            if (bookingId) {
                const updatedBooking = await Booking.findByIdAndUpdate(
                    bookingId,
                    { isPaid: true, status: 'confirmed', paymentMethod: 'Stripe' },
                    { new: true }
                ).populate('room hotel user');

                if (updatedBooking) {
                    console.log(`Booking ${bookingId} successfully verified as PAID via Stripe session.`);

                    // Send payment confirmation email
                    try {
                        await sendBookingEmail({
                            booking: updatedBooking,
                            hotelName: updatedBooking.hotel?.name,
                            roomType: updatedBooking.room?.roomType,
                            guestName: updatedBooking.user?.username,
                            recipientEmail: updatedBooking.user?.email,
                            isPaid: true
                        });
                    } catch (mailError) {
                        console.error("Payment confirmation email sending failed:", mailError.message);
                    }

                    return res.json({
                        success: true,
                        message: "Payment verified successfully!",
                        booking: updatedBooking
                    });
                }
            }
        }

        res.json({ success: false, message: "Payment has not been completed." });
    } catch (error) {
        console.error("verifyStripePayment error:", error);
        res.json({ success: false, message: error.message || "Payment verification failed" });
    }
};
