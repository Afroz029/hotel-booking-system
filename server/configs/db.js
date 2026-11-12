import dns from "node:dns";
import mongoose from 'mongoose';

// Router DNS (192.168.1.250) times out on SRV lookups that mongodb+srv requires.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () =>
            console.log("Database successfully connected")
        );

        mongoose.connection.on('error', (err) => {
            console.error("MongoDB connection error:", err.message);
            if (err.message && err.message.includes('ETIMEDOUT')) {
                console.error("----------------------------------------------------------------");
                console.error("MONGODB ATLAS IP WHITELIST BLOCKED (connect ETIMEDOUT):");
                console.error("MongoDB Atlas is blocking your current IP address.");
                console.error("FIX: 1. Go to cloud.mongodb.com -> Network Access");
                console.error("     2. Click 'Add IP Address'");
                console.error("     3. Choose 'Allow Access From Anywhere' (0.0.0.0/0) and click Confirm.");
                console.error("----------------------------------------------------------------");
            }
        });

        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("Set MONGODB_URI in server/.env");
        }

        const baseUri = mongoUri.replace(/\/+$/, "");
        await mongoose.connect(`${baseUri}/quick-stay`, {
            serverSelectionTimeoutMS: 5000, // Fail fast (5s instead of 30s) if IP is blocked
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);
        if (error.message && error.message.includes('ETIMEDOUT')) {
            console.error("----------------------------------------------------------------");
            console.error("MONGODB ATLAS IP WHITELIST BLOCKED (connect ETIMEDOUT):");
            console.error("MongoDB Atlas is blocking your current IP address.");
            console.error("FIX: 1. Go to cloud.mongodb.com -> Network Access");
            console.error("     2. Click 'Add IP Address'");
            console.error("     3. Choose 'Allow Access From Anywhere' (0.0.0.0/0) and click Confirm.");
            console.error("----------------------------------------------------------------");
        }
    }
};

export default connectDB;
