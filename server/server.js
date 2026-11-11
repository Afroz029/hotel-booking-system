// server.js
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
import {serve} from 'inngest/express'
import userRouter from './routes/userRoutes.js';
import hotelRouter from './routes/hotelRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import roomRouter from './routes/roomRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import { stripeWebhook } from './controllers/stripeWebhooks.js';

await connectDb();
await connectCloudinary();

const app = express();
const allowedOrigin = (origin) => {
  if (!origin) return true;
  if (/\.vercel\.app$/.test(origin)) return true;
  try {
    const { hostname } = new URL(origin);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
};

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://your-project.vercel.app'
    ],
    credentials: true
}));


// app.use(cors({
//     origin: [
//         'http://localhost:5173',
//         'http://127.0.0.1:5173'
//     ],
//     credentials: true
// }));
// Allow local dev, vercel deployments, and an optional custom CLIENT_URL env var
// app.use(cors({
//     origin: (origin, callback) => {
//         if (!origin) return callback(null, true);
//         if (
//             origin.includes('localhost') ||
//             origin.endsWith('.vercel.app') ||
//             (process.env.CLIENT_URL && origin === process.env.CLIENT_URL)
//         ) {
//             return callback(null, true);
//         }
//         return callback(new Error('Blocked by CORS'));
//     },
//     credentials: true
// }));



//Stripe webhook
app.post('/api/stripe', express.raw({type: 'application/json'}), stripeWebhook);


// ✅ After raw middleware, now apply json parsing for other routes
app.use(express.json());

// Clock skew detection for JWT verification (protects against local clock drift)
try {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);
  const timeRes = await fetch('https://api.clerk.com', { signal: controller.signal });
  clearTimeout(timeoutId);
  const serverHeaderDate = timeRes.headers.get('date');
  if (serverHeaderDate) {
    const serverTime = new Date(serverHeaderDate).getTime();
    const localTime = Date.now();
    const offsetMs = serverTime - localTime;
    if (Math.abs(offsetMs) > 5000) {
      console.log(`[Clerk Auth] Clock skew detected: local clock is ${Math.round(offsetMs / 1000)}s offset. Adjusting Date.now for JWT validation.`);
      const realNow = Date.now;
      Date.now = () => realNow() + offsetMs;
    }
  }
} catch (e) {
  // If offline or timeout, continue with standard system clock
}

// Clerk middleware
app.use(clerkMiddleware());

// CLERK WEBHOOK API
app.use('/api/clerk', serve({client: inngest, functions}));



// Health check
app.get('/', (req, res) => {
    res.send('QuickStay server is live!');
});
app.use('/api/user', userRouter);
app.use('/api/hotels', hotelRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/bookings', bookingRouter);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
