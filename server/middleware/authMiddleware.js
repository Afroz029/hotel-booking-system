import User from "../models/User.js";
import { clerkClient, getAuth } from "@clerk/express";

// Middleware to check user authentication and ensure user exists in MongoDB
export const protect = async (req, res, next) => {
    try {
        const auth = typeof getAuth === 'function' ? getAuth(req) : (typeof req.auth === 'function' ? req.auth() : req.auth);
        const userId = auth?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "not authenticated" });
        }

        let user = await User.findById(userId);

        // If user is not yet saved in MongoDB, fetch details from Clerk and create them
        if (!user) {
            try {
                const clerkUser = await clerkClient.users.getUser(userId);
                const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
                const username = `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || email.split("@")[0] || "User";
                const image = clerkUser.imageUrl || "";

                user = await User.findByIdAndUpdate(
                    userId,
                    {
                        _id: userId,
                        username,
                        email,
                        image,
                        role: "user",
                        recentSearchedCities: []
                    },
                    { upsert: true, new: true }
                );
            } catch (clerkErr) {
                console.error("Error fetching/creating user from Clerk:", clerkErr.message);
                return res.json({ success: false, message: "User not found in database and could not be synced from Clerk" });
            }
        }

        req.user = user;
        next();
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
