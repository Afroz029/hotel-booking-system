import dns from "node:dns";
import mongoose from 'mongoose'

// Router DNS (192.168.1.250) times out on SRV lookups that mongodb+srv requires.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDB = async ()=> {
    try {
        mongoose.connection.on('connected', ()=>
            console.log("Database successfully connected")
        );
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error("Set MONGODB_URI in server/.env");
        }
        const baseUri = mongoUri.replace(/\/+$/, "");
        await mongoose.connect(`${baseUri}/quick-stay`)
    } catch (error) {
        console.error(error.message)
    }
}

export default connectDB