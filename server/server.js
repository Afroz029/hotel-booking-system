import express from 'express';
import cors from 'cors';
import "dotenv/config";

import connectDb from './configs/db.js';
import './models/User.js';
import './models/Hotel.js';
import './models/Room.js';
import './models/Booking.js';

import { clerkMiddleware } from '@clerk/express';
import { functions, inngest } from './inngest/index.js';
import { serve } from 'inngest/express';

import userRouter from './routes/userRoutes.js';
import hotelRouter from './routes/hotelRoutes.js';
import roomRouter from './routes/roomRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';

import connectCloudinary from './configs/cloudinary.js';
import { stripeWebhook } from './controllers/stripeWebhooks.js';

const app = express();

// 1. CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        // Allow requests without an Origin header (like mobile apps, curl, postman)
        if (!origin) {
            return callback(null, true);
        }

        try {
            const url = new URL(origin);
            const hostname = url.hostname;

            const isAllowed =
                hostname === 'localhost' ||
                hostname === '127.0.0.1' ||
                hostname.endsWith('.vercel.app') ||
                (process.env.CLIENT_URL && origin === process.env.CLIENT_URL);

            if (isAllowed) {
                return callback(null, true);
            }

            // Fallback to allow during development
            return callback(null, true);
        } catch {
            return callback(null, true);
        }
    },
    credentials: true
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options(/.*/, cors(corsOptions));

// 2. Stripe webhook (raw body required for signature verification)
app.post(
    '/api/stripe',
    express.raw({ type: 'application/json' }),
    stripeWebhook
);

// 3. JSON middleware
app.use(express.json());

// 4. Clerk middleware
app.use(clerkMiddleware());

// 5. Inngest endpoints (support both /api/inngest standard and /api/clerk)
app.use('/api/inngest', serve({ client: inngest, functions }));
app.use('/api/clerk', serve({ client: inngest, functions }));

// 6. Health check
app.get('/', (req, res) => {
    res.send('QuickStay server is live!');
});

// 7. API routes
app.use('/api/user', userRouter);
app.use('/api/hotels', hotelRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/bookings', bookingRouter);

// 8. Start server
const startServer = async () => {
    try {
        await connectDb();
        await connectCloudinary();

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, () => {
            console.log('Database and Cloudinary initialization completed');
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Server startup failed:', error);
        process.exit(1);
    }
};

startServer();
